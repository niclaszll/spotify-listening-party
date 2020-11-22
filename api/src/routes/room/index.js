import express from 'express'

import {
  createNewRoom,
  joinRoom,
  sendRoomInformation,
  leaveActiveRoom,
  distributeMessage,
  sendNewQueue,
  sendTogglePlay,
  sendSkipForward,
  updateAvailableRooms,
} from './handlers.js'

export default function roomRouter(io) {
  const router = express.Router()

  io.on('connection', (socket) => {
    console.log('New client connected')

    socket.on('create', (data) => {
      createNewRoom(socket, data.message)
    })

    socket.on('join', (data) => {
      joinRoom(io, socket, data.message.roomId)
      sendRoomInformation(socket, data.message.roomId)
    })

    socket.on('leave', () => {
      leaveActiveRoom(io, socket)
    })

    socket.on('new-message', (data) => {
      distributeMessage(io, socket, data.message)
    })

    socket.on('new-queue', (data) => {
      sendNewQueue(io, socket, data.message.msg)
    })

    socket.on('toggle-play', (data) => {
      sendTogglePlay(io, socket, data.message.msg)
    })

    socket.on('skip-forward', () => {
      sendSkipForward(io, socket)
    })

    socket.on('get-available-rooms', () => {
      updateAvailableRooms(io, socket, false)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })

  return router
}
