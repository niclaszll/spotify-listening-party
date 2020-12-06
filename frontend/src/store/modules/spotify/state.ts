import { CurrentTrackResponse, Room } from '../../../util/types/rooms'
import {
  SpotifyPlaylist,
  WebPlaybackTrack,
  SpotifyUser,
  SpotifyPlayerStatus,
} from '../../../util/types/spotify'

export const initialCurrentRoom = {
  name: '',
  roomPublic: true,
  activeListeners: 0,
  queue: [],
  creatorId: '',
  currentTrack: null,
}

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
  queue: WebPlaybackTrack[]
  user: SpotifyUser | null
  currentTrack: CurrentTrackResponse | null
  playbackInfo: SpotifyPlayerStatus | null
  currentRoom: Room
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  queue: [],
  user: null,
  currentTrack: null,
  playbackInfo: null,
  currentRoom: initialCurrentRoom,
}

export default initialState
