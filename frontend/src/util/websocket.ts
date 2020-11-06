import socketIOClient from 'socket.io-client'

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:9000'

export const socket = socketIOClient(`${ENDPOINT}`)

export type Response<T> = {
  source: string
  message: {
    payload: T
  }
}

export function newSocketRoom(name: string) {
  socket.emit('create', {
    source: 'client',
    message: { name },
  })
}

export function joinSocketRoom(roomId: string) {
  socket.emit('join', {
    source: 'client',
    message: { roomId },
  })
}

export function sendMessage(msg: string) {
  socket.emit('new-message', {
    source: 'client',
    message: { msg },
  })
}

export function sendPlayUri(msg: string) {
  socket.emit('play', {
    source: 'client',
    message: { msg },
  })
}

export function getAvailableRooms() {
  socket.emit('get-available-rooms', {
    source: 'client',
  })
}
