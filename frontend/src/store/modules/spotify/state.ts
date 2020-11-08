import { SpotifyPlaylist } from '../../../util/types/spotify'

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
}

export default initialState
