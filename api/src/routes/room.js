import express from 'express'
import {id} from '../util/common.js'
import RoomModel from '../models/room.js'

export default function roomRouter(io) {
  const router = express.Router()

  // TODO: handle DB update and inform other clients
  const leaveActiveRoom = (socket) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    if (room) {
      socket.leave(room)
    }
  }

  const createRoom = (socket, message) => {
    const {name, roomPublic, active_listeners} = message
    const roomId = `room${id()}`
    const roomName = name !== '' ? name : roomId
    const newRoom = {id: roomId, name: roomName, roomPublic, active_listeners}

    const room = new RoomModel(newRoom)

    try {
      room.save().then(
        socket.emit('room', {
          source: 'server',
          message: {payload: roomId},
        })
      )
      console.log(`Created room ${roomName} with id ${roomId}`)
    } catch (err) {
      console.log('Error creating a new room')
    }
  }

  const updateAvailableRooms = async (socket, distributeAll) => {
    const rooms = await RoomModel.find({})
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
  }

  const joinRoom = async (socket, roomId) => {
    leaveActiveRoom(socket)
    socket.join(roomId)

    const room = await RoomModel.findOne({id: roomId})
    console.log(`Joined room ${room.name} with id ${roomId}`)

    const listenersCount =
      io.sockets.adapter.rooms[room.id] !== undefined ? io.sockets.adapter.rooms[room.id].length : 0

    try {
      await RoomModel.findByIdAndUpdate(room._id, {active_listeners: listenersCount})
      updateAvailableRooms(socket, true)
      console.log(`Room ${room.name} has now ${listenersCount} listener(s)`)
    } catch (err) {
      console.log(`Error joining the room ${err}`)
      socket.emit('error-event')
    }
  }

  const sendRoomInformation = async (socket, roomId) => {
    const roomInfo = await RoomModel.findOne({id: roomId})
    socket.emit('room-info', {
      source: 'server',
      message: {payload: roomInfo.queue},
    })
  }

  const distributeMessage = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    io.sockets.in(room).emit('chat', {
      source: 'server',
      message: {payload: msg},
    })
  }

  const sendNewQueue = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    // RoomModel.updateOne({id: room}, {queue: msg})
    RoomModel.updateOne({id: room}, {queue: msg}, function (err, res) {
      if (err) {
        console.log(err)
      }
    })
    io.sockets.in(room).emit('new-queue', {
      source: 'server',
      message: {payload: msg},
    })
  }

  const sendTogglePlay = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    io.sockets.in(room).emit('toggle-play', {
      source: 'server',
      message: {payload: msg},
    })
  }

  const sendSkipForward = (socket) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    io.sockets.in(room).emit('skip-forward', {
      source: 'server',
    })
  }

  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('create', (data) => {
      createRoom(socket, data.message)
    })

    socket.on('join', (data) => {
      joinRoom(socket, data.message.roomId)
      sendRoomInformation(socket, data.message.roomId)
    })

    socket.on('new-message', (data) => {
      distributeMessage(socket, data.message.msg)
    })

    socket.on('new-queue', (data) => {
      sendNewQueue(socket, data.message.msg)
    })

    socket.on('toggle-play', (data) => {
      sendTogglePlay(socket, data.message.msg)
    })

    socket.on('skip-forward', () => {
      sendSkipForward(socket)
    })

    socket.on('get-available-rooms', () => {
      updateAvailableRooms(socket, false)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  return router
}
