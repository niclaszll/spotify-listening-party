import { WebPlaybackTrack } from './spotify'

export type Room = {
  id?: string
  name: string
  roomPublic: Boolean
  roomPassword?: String
  activeListeners: string[]
  queue: WebPlaybackTrack[]
  shuffledQueue: WebPlaybackTrack[]
  shuffled: Boolean
  creatorId: string
  currentTrack: CurrentTrackResponse | null
}

export type Message = {
  msg: string
  user: string
}

export type CurrentTrackResponse = {
  position_ms: number
  paused: Boolean
  uri: string
  timestamp: Date
}

export type RoomInfoResponse = {
  source: string
  message: {
    payload: {
      queue: WebPlaybackTrack[]
      currentTrack: CurrentTrackResponse
    }
  }
}
