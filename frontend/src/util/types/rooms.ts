import { WebPlaybackTrack } from './spotify'

export type Room = {
  id?: string,
  name: string
  roomPublic: Boolean,
  activeListeners: number
}

export type Message = {
  msg: string,
  user: string
}

export type CurrentTrackResponse = {
  position_ms: number,
  paused: Boolean,
  uri: string,
  timestamp: Date,
}

export type RoomInfoResponse = {
  source: string
  message: {
    payload: {
      queue: WebPlaybackTrack[],
      currentTrack: CurrentTrackResponse,
    }
  }
}
