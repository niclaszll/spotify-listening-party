import {id} from '../../util/common.js'
import {getAllRooms, createRoom, findRoomById, updateRoom} from '../../persistence/queries.js'

export async function sendFullRoomInformation(io, socket, roomId, distributeToRoom) {
  return findRoomById(roomId).then((room) => {
    if (distributeToRoom) {
      io.sockets.in(roomId).emit('room-full-info', {
        source: 'server',
        message: {payload: room},
      })
    } else {
      socket.emit('room-full-info', {
        source: 'server',
        message: {payload: room},
      })
    }
  })
}

export function updateAvailableRooms(io, socket, distributeAll) {
  getAllRooms().then((rooms) => {
    if (distributeAll) {
      io.sockets.emit('available-rooms', {
        source: 'server',
        message: {payload: rooms},
      })
    } else {
      socket.emit('available-rooms', {
        source: 'server',
        message: {payload: rooms},
      })
    }
  })
}

export async function leaveActiveRoom(io, socket, username) {
  const roomId = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  if (roomId) {
    socket.leave(roomId)
    return findRoomById(roomId)
      .then((room) =>
        updateRoom(roomId, {activeListeners: room.activeListeners.filter((listener) => listener !== username)})
      )
      .then(() => updateAvailableRooms(io, socket, true))
      .then(() => roomId)
      .catch((err) => console.log(err))
  }
  return ''
}

export async function createNewRoom(socket, message) {
  const {name, roomPublic, activeListeners} = message
  const roomId = `room${id()}`
  const roomName = name !== '' ? name : roomId
  const creatorId = socket.id
  const newRoom = {id: roomId, name: roomName, roomPublic, activeListeners, creatorId}

  return createRoom(newRoom)
    .then(() => {
      socket.emit('room', {
        source: 'server',
        message: {payload: roomId},
      })
    })
    .catch((err) => console.log(err))
}

export async function joinRoom(io, socket, roomId, username) {
  socket.join(roomId)

  return findRoomById(roomId).then((room) => {
    console.log(`Joined room ${room.name} with id ${roomId}`)

    const activeListeners = [...room.activeListeners, username]

    return updateRoom(roomId, {activeListeners})
      .then(() => {
        updateAvailableRooms(io, socket, true)
        console.log(`Room ${room.name} has now ${activeListeners.length} listener(s)`)
      })
      .catch((err) => {
        console.log(`Error joining the room ${err}`)
        socket.emit('error-event')
      })
  })
}

export function distributeMessage(io, socket, msg) {
  const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  io.sockets.in(room).emit('chat', {
    source: 'server',
    message: {payload: msg},
  })
}

export function skipTrack(io, socket, roomId) {
  findRoomById(roomId).then((room) => {
    if (room.queue.length > 0) {
      const nextTrack = {
        position_ms: 0,
        paused: false,
        uri: room.queue[0].uri,
        timestamp: new Date(),
      }
      room.queue.shift()
      updateRoom(roomId, {currentTrack: nextTrack, queue: room.queue}).then(() => {
        sendFullRoomInformation(io, socket, roomId, true)
      })
    }
  })
}

export function updateQueue(io, socket, msg) {
  findRoomById(msg.roomId).then((room) => {
    const newQueue = [...room.queue, msg.track]
    updateRoom(msg.roomId, {queue: newQueue}).then(() => {
      sendFullRoomInformation(io, socket, msg.roomId, true).then(() => {
        if (room.currentTrack === null && newQueue.length > 0) {
          skipTrack(io, socket, msg.roomId)
        }
      })
    })
  })
}

export function clearQueue(io, socket, msg) {
  updateRoom(msg.roomId, {queue: []}).then(() => sendFullRoomInformation(io, socket, msg.roomId, true))
}

export function updateTrackState(io, socket, msg) {
  findRoomById(msg.roomId).then((room) => {
    updateRoom(msg.roomId, {currentTrack: {...room.currentTrack, paused: msg.paused}}).then(() => {
      sendFullRoomInformation(io, socket, msg.roomId, true)
    })
  })
}

export async function setCurrentTrack(io, socket, msg) {
  const roomId = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  const currentTrack = {
    position_ms: msg.duration_ms || 0,
    paused: msg.paused ? msg.paused : false,
    uri: msg.uri,
    timestamp: new Date(),
  }
  updateRoom(roomId, {currentTrack}).then(() => {
    sendFullRoomInformation(io, socket, roomId, true)
  })
}
