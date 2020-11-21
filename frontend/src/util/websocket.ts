import socketIOClient from 'socket.io-client'
import { Message, Room } from './types/rooms'
import { WebPlaybackTrack } from './types/spotify'

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:9000'

export const socket = socketIOClient(`${ENDPOINT}`)

export type Response<T> = {
  source: string
  message: {
    payload: T
  }
}

export function newSocketRoom(room: Room) {
  socket.emit('create', {
    source: 'client',
    message: room,
  })
}

export function joinSocketRoom(roomId: string) {
  socket.emit('join', {
    source: 'client',
    message: { roomId },
  })
}

export function leaveSocketRoom() {
  socket.emit('leave', {
    source: 'client',
  })
}

export function sendMessage(msg: Message) {
  socket.emit('new-message', {
    source: 'client',
    message: msg,
  })
}

export function sendQueue(msg: WebPlaybackTrack[]) {
  socket.emit('new-queue', {
    source: 'client',
    message: { msg },
  })
}

export function getAvailableRooms() {
  socket.emit('get-available-rooms', {
    source: 'client',
  })
}

export function sendSkipTrack() {
  socket.emit('skip-forward', {
    source: 'client',
  })
}

export function sendTogglePlay(msg: Boolean) {
  socket.emit('toggle-play', {
    source: 'client',
    message: { msg },
  })
}
