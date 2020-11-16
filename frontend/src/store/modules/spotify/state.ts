import { CurrentTrackResponse } from '../../../util/types/rooms'
import { SpotifyPlaylist, WebPlaybackTrack, SpotifyUser } from '../../../util/types/spotify'

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
  queue: WebPlaybackTrack[]
  user: SpotifyUser | null
  currentTrack: CurrentTrackResponse | null
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  queue: [],
  user: null,
  currentTrack: null,
}

export default initialState
