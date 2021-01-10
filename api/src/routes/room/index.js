import express from 'express'

import {
  createNewRoom,
  joinRoom,
  leaveActiveRoom,
  distributeMessage,
  updateQueue,
  clearQueue,
  updateTrackState,
  updateAvailableRooms,
  setCurrentTrack,
  sendFullRoomInformation,
  skipTrack,
  checkIfRoomIsPrivate,
  checkIfPasswordCorrect,
  toggleShuffle,
} from './handlers.js'

export default function roomRouter(io) {
  const router = express.Router()

  router.get('/health', (req, res) => {
    res.send('Healthy')
  })

  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('create', (data) => {
      createNewRoom(socket, data.message).then(() => {
        sendFullRoomInformation(io, socket, data.message.roomId, true)
      })
    })

    socket.on('join', (data) => {
      const {roomId, username} = data.message
      joinRoom(io, socket, roomId, username).then(() => {
        sendFullRoomInformation(io, socket, data.message.roomId, true)
      })
    })

    socket.on('check-private', (data) => {
      const roomId = data.message
      checkIfRoomIsPrivate(socket, roomId)
    })

    socket.on('check-password', (data) => {
      const {roomId, username, password} = data.message
      // TODO: put checkIfPasswordCorrect into joinRoom, else private rooms are accessible via public endpoint
      checkIfPasswordCorrect(roomId, password).then((correct) => {
        if (correct) {
          joinRoom(io, socket, roomId, username).then(() => {
            sendFullRoomInformation(io, socket, data.message.roomId, true)
          })
        }
      })
    })

    socket.on('leave', (data) => {
      leaveActiveRoom(io, socket, data.message).then((roomId) => {
        sendFullRoomInformation(io, socket, roomId, true)
      })
    })

    socket.on('new-message', (data) => {
      distributeMessage(io, socket, data.message)
    })

    socket.on('add-to-queue', (data) => {
      updateQueue(io, socket, data.message)
    })

    socket.on('clear-queue', (data) => {
      clearQueue(io, socket, data.message)
    })

    socket.on('toggle-play', (data) => {
      updateTrackState(io, socket, data.message)
    })

    socket.on('skip-forward', (data) => {
      skipTrack(io, socket, data.message.roomId)
    })

    socket.on('get-available-rooms', () => {
      updateAvailableRooms(io, socket, false)
    })

    socket.on('current-track', (data) => {
      setCurrentTrack(io, socket, data.message.msg)
    })

    socket.on('toggle-shuffle', (data) => {
      toggleShuffle(io, socket, data.message)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  return router
}
