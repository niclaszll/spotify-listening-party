import socketIOClient from 'socket.io-client'

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:9000'

export const socket = socketIOClient(`${ENDPOINT}`)

export type Response = {
  source: string
  message: {
    payload: string
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
