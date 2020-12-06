import { CurrentTrackResponse, Room } from '../../../util/types/rooms'
import { SpotifyPlaylist, SpotifyUser, SpotifyPlayerStatus } from '../../../util/types/spotify'

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
  user: SpotifyUser | null
  currentTrack: CurrentTrackResponse | null
  playbackInfo: SpotifyPlayerStatus | null
  currentRoom: Room
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  user: null,
  currentTrack: null,
  playbackInfo: null,
  currentRoom: initialCurrentRoom,
}

export default initialState
