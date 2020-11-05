import express from 'express'
import {id} from '../util/common.js'
import {readFile, writeFile, dataPath} from '../util/files.js'

export default function roomRouter(io) {
  const router = express.Router()

  const sendMessage = (socket, msg) => {
    socket.emit('room', {
      source: 'server',
      message: {payload: msg},
    })
  }

  const leaveActiveRoom = (socket) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    if (room) {
      socket.leave(room)
    }
  }

  const createRoom = (socket, name) => {
    const roomId = `room${id()}`

    readFile(
      (data) => {
        // add the new room
        const roomName = name !== '' ? name : roomId
        data[roomId] = {name: roomName}

        writeFile(
          JSON.stringify(data, null, 2),
          () => {
            sendMessage(socket, roomId)
            console.log(`Created room ${roomName} with id ${roomId}`)
          },
          dataPath
        )
      },
      true,
      dataPath
    )
  }

  const joinRoom = (socket, roomId) => {
    readFile(
      (data) => {
        // try to find room (if it exists -> else catch and send error)
        try {
          const room = data[roomId]
          leaveActiveRoom(socket)
          socket.join(roomId)
          console.log(`Joined room ${room.name} with id ${roomId}`)
        } catch (e) {
          socket.emit('error-event')
        }
      },
      true,
      dataPath
    )
  }

  const distributeMessage = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    console.log(room)
    io.sockets.in(room).emit('room', {
      source: 'server',
      message: {payload: msg},
    })
  }

  const playSong = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    io.sockets.in(room).emit('play-song', {
      source: 'server',
      message: {payload: msg},
    })
  }

  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('create', (data) => {
      createRoom(socket, data.message.name)
    })

    socket.on('join', (data) => {
      joinRoom(socket, data.message.roomId)
    })

    socket.on('new-message', (data) => {
      distributeMessage(socket, data.message.msg)
    })

    socket.on('play', (data) => {
      playSong(socket, data.message.msg)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  return router
}
