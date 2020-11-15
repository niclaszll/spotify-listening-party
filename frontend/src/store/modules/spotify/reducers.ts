import { PayloadAction } from '@reduxjs/toolkit'
import { SpotifyPlaylist, SpotifyUser, WebPlaybackTrack } from '../../../util/types/spotify'
import initialState, { SpotifyState } from './state'

export default {
  setUserToken(state: SpotifyState, action: PayloadAction<string>) {
    return { ...state, token: action.payload }
  },
  clearSpotifyState() {
    return { ...initialState }
  },
  setActivePlaylist(state: SpotifyState, action: PayloadAction<SpotifyPlaylist>) {
    return { ...state, activePlaylist: action.payload }
  },
  setQueue(state: SpotifyState, action: PayloadAction<WebPlaybackTrack[]>) {
    return { ...state, queue: action.payload }
  },
  setUser(state: SpotifyState, action: PayloadAction<SpotifyUser>) {
    return { ...state, user: action.payload }
  },
}
