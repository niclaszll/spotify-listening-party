import { SpotifyPlaylist, WebPlaybackTrack, SpotifyUser } from '../../../util/types/spotify'

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
  queue: WebPlaybackTrack[]
  user: SpotifyUser | null
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  queue: [],
  user: null,
}

export default initialState
