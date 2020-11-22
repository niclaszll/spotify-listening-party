import {id} from '../../util/common.js'
import {getAllRooms, createRoom, findRoomById, updateRoom} from '../../persistence/queries.js'

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

export function leaveActiveRoom(io, socket) {
  const roomId = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  if (roomId) {
    socket.leave(roomId)
    findRoomById(roomId)
      .then((room) => updateRoom(roomId, {active_listeners: room.active_listeners - 1}))
      .then(() => updateAvailableRooms(io, socket, true))
      .catch((err) => console.log(err))
  }
}

export function createNewRoom(socket, message) {
  const {name, roomPublic, active_listeners} = message
  const roomId = `room${id()}`
  const roomName = name !== '' ? name : roomId
  const creatorId = socket.id
  const newRoom = {id: roomId, name: roomName, roomPublic, active_listeners, creatorId}

  createRoom(newRoom)
    .then(
      socket.emit('room', {
        source: 'server',
        message: {payload: roomId},
      })
    )
    .catch((err) => console.log(err))
}

export function joinRoom(io, socket, roomId) {
  socket.join(roomId)

  findRoomById(roomId).then((room) => {
    console.log(`Joined room ${room.name} with id ${roomId}`)

    const listenersCount =
      io.sockets.adapter.rooms[room.id] !== undefined ? io.sockets.adapter.rooms[room.id].length : 0

    updateRoom(roomId, {active_listeners: listenersCount})
      .then(() => {
        updateAvailableRooms(io, socket, true)
        console.log(`Room ${room.name} has now ${listenersCount} listener(s)`)
      })
      .catch((err) => {
        console.log(`Error joining the room ${err}`)
        socket.emit('error-event')
      })
  })
}

export function sendRoomInformation(socket, roomId) {
  findRoomById(roomId).then((room) => {
    socket.emit('room-info', {
      source: 'server',
      message: {payload: {queue: room.queue, currentTrack: room.currentTrack}},
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

export function sendNewQueue(io, socket, msg) {
  const roomId = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  updateRoom(roomId, {queue: msg}).then(
    io.sockets.in(roomId).emit('new-queue', {
      source: 'server',
      message: {payload: msg},
    })
  )
}

export function sendTogglePlay(io, socket, msg) {
  const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  io.sockets.in(room).emit('toggle-play', {
    source: 'server',
    message: {payload: msg},
  })
}

export function sendSkipForward(io, socket) {
  const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  io.sockets.in(room).emit('skip-forward', {
    source: 'server',
  })
}

export function setCurrentTrack(socket, msg) {
  const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
  const currentTrack = {
    position: msg.duration_ms,
    paused: msg.paused ? msg.paused : false,
    uri: msg.uri,
    timestamp: new Date(),
  }
  updateRoom(room, {currentTrack})
}
