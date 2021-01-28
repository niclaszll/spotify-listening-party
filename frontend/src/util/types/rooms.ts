import { WebPlaybackTrack } from './spotify'

/**
 * Corresponds to a virtual room where music is listened to.
 */
export type Room = {
  id?: string
  name: string
  roomPublic: Boolean
  roomPassword?: String
  activeListeners: string[]
  queue: WebPlaybackTrack[]
  shuffledQueue: WebPlaybackTrack[]
  history: WebPlaybackTrack[]
  shuffled: Boolean
  creatorId: string
  currentTrack: CurrentTrack | null
}

/**
 * A chat message
 */
export type Message = {
  msg: string
  user: string
}

/**
 * Type of the currently active track inside a room
 */
export type CurrentTrack = {
  position_ms: number
  paused: Boolean
  uri: string
  timestamp: Date
}
