import socketIOClient from 'socket.io-client'
import { Message, Room } from './types/rooms'
import { WebPlaybackTrack } from './types/spotify'

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:9000'

export const socket = socketIOClient(`${ENDPOINT}`, {
  path: '/backend/socket.io',
})

/**
 * The generic server response
 */
export type Response<T> = {
  source: string
  message: {
    payload: T
  }
}

/**
 * Create a new socket room
 * @param {Room} room - The room to be created
 */
export function newSocketRoom(room: Room) {
  socket.emit('room/create', {
    source: 'client',
    message: room,
  })
}

/**
 * Join an existing socket room
 * @param {string} roomId - The id of the room
 * @param {string} username - The username of the client
 * @param {string} password - Optional password to access private rooms
 */
export function joinSocketRoom(roomId: string, username: string, password: string = '') {
  socket.emit('room/join', {
    source: 'client',
    message: { roomId, username, password },
  })
}

/**
 * Check if room is private
 * @param {string} roomId - The id of the room
 */
export function checkIfRoomIsPrivate(roomId: string) {
  socket.emit('room/is_private', {
    source: 'client',
    message: { roomId },
  })
}

/**
 * Leave a socket room
 * @param {string} username - The clients username
 */
export function leaveSocketRoom(username: string) {
  socket.emit('room/leave', {
    source: 'client',
    message: { username },
  })
}

/**
 * Send a chat message
 * @param {Message} msg - Message to be sent
 */
export function sendMessage(msg: Message) {
  socket.emit('room/chat/new_message', {
    source: 'client',
    message: msg,
  })
}

/**
 * Add a track to the current queue
 * @param {WebPlaybackTrack} track - Track to add to the queue
 * @param {string} roomId - The id of the associated room
 */
export function addToQueue(track: WebPlaybackTrack, roomId: string) {
  socket.emit('room/queue/add_track', {
    source: 'client',
    message: { track, roomId },
  })
}

/**
 * Clear the current queue
 * @param {string} roomId - The id of the associated room
 */
export function clearQueue(roomId: string) {
  socket.emit('room/queue/clear', {
    source: 'client',
    message: { roomId },
  })
}

/**
 * Toggle between paused and playing state.
 * @param {Boolean} paused - New state
 * @param {string} roomId - The id of the associated room
 */
export function sendTogglePlay(paused: Boolean, roomId: string) {
  socket.emit('room/player/toggle_play', {
    source: 'client',
    message: { paused, roomId },
  })
}

/**
 * Get all available rooms.
 */
export function getAvailableRooms() {
  socket.emit('room/get_all', {
    source: 'client',
  })
}

/**
 * Skip to the next track.
 * @param {string} roomId - The id of the associated room
 */
export function sendSkipForward(roomId: string) {
  socket.emit('room/player/skip_forward', {
    source: 'client',
    message: { roomId },
  })
}

/**
 * Toggle between shuffled mode.
 * @param {Boolean} shuffled - Is shuffle enabled
 * @param {string} roomId - The id of the associated room
 */
export function sendToggleShuffle(shuffled: Boolean, roomId: string) {
  socket.emit('room/player/toggle_shuffle', {
    source: 'client',
    message: { shuffled, roomId },
  })
}
