import socketIOClient from 'socket.io-client'
import { Message, Room } from './types/rooms'
import { WebPlaybackTrack } from './types/spotify'

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:9000'

export const socket = socketIOClient(`${ENDPOINT}`, {
  path: '/backend/socket.io',
})

export type Response<T> = {
  source: string
  message: {
    payload: T
  }
}

export function newSocketRoom(room: Room) {
  socket.emit('room/create', {
    source: 'client',
    message: room,
  })
}

export function joinSocketRoom(roomId: string, username: string, password: string = '') {
  console.log(username)
  socket.emit('room/join', {
    source: 'client',
    message: { roomId, username, password },
  })
}

export function checkIfRoomIsPrivate(roomId: string) {
  socket.emit('room/is_private', {
    source: 'client',
    message: { roomId },
  })
}

export function leaveSocketRoom(username: string) {
  socket.emit('room/leave', {
    source: 'client',
    message: { username },
  })
}

export function sendMessage(msg: Message) {
  socket.emit('room/chat/new_message', {
    source: 'client',
    message: msg,
  })
}

export function addToQueue(track: WebPlaybackTrack, roomId: String) {
  socket.emit('room/queue/add_track', {
    source: 'client',
    message: { track, roomId },
  })
}

export function clearQueue(roomId: String) {
  socket.emit('room/queue/clear', {
    source: 'client',
    message: { roomId },
  })
}

export function sendTogglePlay(paused: Boolean, roomId: String) {
  socket.emit('room/player/toggle_play', {
    source: 'client',
    message: { paused, roomId },
  })
}

export function getAvailableRooms() {
  socket.emit('room/get_all', {
    source: 'client',
  })
}

export function sendSkipForward(roomId: String) {
  socket.emit('room/player/skip_forward', {
    source: 'client',
    message: { roomId },
  })
}

export function sendToggleShuffle(shuffled: Boolean, roomId: String) {
  socket.emit('room/player/toggle_shuffle', {
    source: 'client',
    message: { shuffled, roomId },
  })
}
