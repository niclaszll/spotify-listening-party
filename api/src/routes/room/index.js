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
  sendFullRoomInformation,
  skipForward,
  skipBackward,
  checkIfRoomIsPrivate,
  toggleShuffle,
  handleError,
} from './handlers.js'

export default function roomRouter(io) {
  const router = express.Router()

  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('room/create', (data) => {
      createNewRoom(socket, data.message).then(() => {
        sendFullRoomInformation(io, socket, data.message.roomId, true)
      })
    })

    socket.on('room/join', (data) => {
      const {roomId, username, password} = data.message
      joinRoom(io, socket, roomId, username, password)
        .then(() => {
          sendFullRoomInformation(io, socket, data.message.roomId, true)
        })
        .catch((err) => {
          handleError(socket, err)
        })
    })

    socket.on('room/is_private', (data) => {
      const {roomId} = data.message
      checkIfRoomIsPrivate(socket, roomId)
    })

    socket.on('room/leave', (data) => {
      const {username} = data.message
      leaveActiveRoom(io, socket, username).then((roomId) => {
        sendFullRoomInformation(io, socket, roomId, true)
      })
    })

    socket.on('room/chat/new_message', (data) => {
      distributeMessage(io, socket, data.message)
    })

    socket.on('room/queue/add_track', (data) => {
      updateQueue(io, socket, data.message)
    })

    socket.on('room/queue/clear', (data) => {
      clearQueue(io, socket, data.message)
    })

    socket.on('room/player/toggle_play', (data) => {
      updateTrackState(io, socket, data.message)
    })

    socket.on('room/player/skip_forward', (data) => {
      skipForward(io, socket, data.message.roomId)
    })

    socket.on('room/player/skip_backward', (data) => {
      skipBackward(io, socket, data.message.roomId)
    })

    socket.on('room/get_all', () => {
      updateAvailableRooms(io, socket, false)
    })

    socket.on('room/player/toggle_shuffle', (data) => {
      toggleShuffle(io, socket, data.message)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  return router
}
