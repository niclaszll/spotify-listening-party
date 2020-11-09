import { SpotifyPlaylist, WebPlaybackTrack } from '../../../util/types/spotify'

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
  queue: WebPlaybackTrack[]
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  queue: [],
}

export default initialState
