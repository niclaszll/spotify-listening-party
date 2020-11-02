import express from 'express'
import {id} from '../util/common.js'

export default function roomRouter(io, fs) {
  const router = express.Router()

  const dataPath = './src/data/rooms.json'

  const sendMessage = (socket, msg) => {
    socket.emit('room', {
      source: 'server',
      message: {payload: msg},
    })
  }

  const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
      if (err) {
        throw err
      }

      callback(returnJson ? JSON.parse(data) : data)
    })
  }

  const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {
    fs.writeFile(filePath, fileData, encoding, (err) => {
      if (err) {
        throw err
      }

      callback()
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

    readFile((data) => {
      // add the new room
      const roomName = name !== '' ? name : roomId
      data[roomId] = {name: roomName}

      writeFile(JSON.stringify(data, null, 2), () => {
        sendMessage(socket, roomId)
        console.log(`Created room ${roomName} with id ${roomId}`)
      })
    }, true)
  }

  const joinRoom = (socket, roomId) => {
    readFile((data) => {
      // try to find room (if it exists -> else catch and send error)
      try {
        const room = data[roomId]
        leaveActiveRoom(socket)
        socket.join(roomId)
        console.log(`Joined room ${room.name} with id ${roomId}`)
      } catch (e) {
        socket.emit('error-event')
      }
    }, true)
  }

  const distributeMessage = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    console.log(room)
    io.sockets.in(room).emit('room', {
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

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  return router
}
