import {
  SpotifyPlaylist, WebPlaybackTrack, SpotifyUser, SpotifyPlayerStatus,
} from '../../../util/types/spotify'

export type SpotifyState = {
  token: string | null
  activePlaylist: SpotifyPlaylist | null
  queue: WebPlaybackTrack[]
  user: SpotifyUser | null
  playbackInfo: SpotifyPlayerStatus | null
}

const initialState: SpotifyState = {
  token: null,
  activePlaylist: null,
  queue: [],
  user: null,
  playbackInfo: null,
}

export default initialState
