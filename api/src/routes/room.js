import express from 'express'
import {id} from '../util/common.js'
import {readFile, writeFile, dataPath} from '../util/files.js'

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
    const {name, roomPublic, listeners} = message
    const roomId = `room${id()}`

    readFile(
      (data) => {
        // add the new room
        const roomName = name !== '' ? name : roomId
        data[roomId] = {id: roomId, name: roomName, roomPublic, listeners}

        writeFile(
          JSON.stringify(data, null, 2),
          () => {
            socket.emit('room', {
              source: 'server',
              message: {payload: roomId},
            })
            console.log(`Created room ${roomName} with id ${roomId}`)
          },
          dataPath
        )
      },
      true,
      dataPath
    )
  }

  const updateAvailableRooms = (socket, distributeAll) => {
    readFile(
      (data) => {
        const rooms = Object.values(data)
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
          const listenersCount = data[roomId].listeners + 1
          data[roomId].listeners = listenersCount
          console.log(`Joined room ${room.name} with id ${roomId}`)

          // update DB with new listener count
          writeFile(
            JSON.stringify(data, null, 2),
            () => {
              updateAvailableRooms(socket, true)
              console.log(`Room ${room.name} has now ${listenersCount} listener(s)`)
            },
            dataPath
          )
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

  const sendNewQueue = (socket, msg) => {
    const room = Object.keys(socket.rooms).filter((item) => item !== socket.id)[0]
    io.sockets.in(room).emit('new-queue', {
      source: 'server',
      message: {payload: msg},
    })
  }

  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('create', (data) => {
      createRoom(socket, data.message)
    })

    socket.on('join', (data) => {
      joinRoom(socket, data.message.roomId)
    })

    socket.on('new-message', (data) => {
      distributeMessage(socket, data.message.msg)
    })

    socket.on('new-queue', (data) => {
      sendNewQueue(socket, data.message.msg)
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
