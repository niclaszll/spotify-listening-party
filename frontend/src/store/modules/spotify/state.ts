import { Room } from '../../../util/types/rooms'
import { SpotifyPlaylist, SpotifyUser, SpotifyPlayerStatus } from '../../../util/types/spotify'

export const initialCurrentRoom = {
  name: '',
  roomPublic: true,
  activeListeners: [],
  queue: [],
  shuffledQueue: [],
  history: [],
  shuffled: false,
  creatorId: '',
  currentTrack: null,
}

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
  user: SpotifyUser | null
  playbackInfo: SpotifyPlayerStatus | null
  currentRoom: Room
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  user: null,
  playbackInfo: null,
  currentRoom: initialCurrentRoom,
}

export default initialState
