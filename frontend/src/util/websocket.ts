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

export function addToQueue(track: WebPlaybackTrack, roomId: String) {
  socket.emit('add-to-queue', {
    source: 'client',
    message: { track, roomId },
  })
}

export function clearQueue(roomId: String) {
  socket.emit('clear-queue', {
    source: 'client',
    message: { roomId },
  })
}

export function getAvailableRooms() {
  socket.emit('get-available-rooms', {
    source: 'client',
  })
}

export function sendSkipForward(roomId: String) {
  socket.emit('skip-forward', {
    source: 'client',
    message: { roomId },
  })
}

export function sendTogglePlay(paused: Boolean, roomId: String) {
  socket.emit('toggle-play', {
    source: 'client',
    message: { paused, roomId },
  })
}

export function sendCurrentTrack(msg: { paused: Boolean; position: number; uri: string }) {
  socket.emit('current-track', {
    source: 'client',
    message: { msg },
  })
}
