import { createSlice } from '@reduxjs/toolkit'
import initialState, { SpotifyState } from './state'
import reducers from './reducers'
import { AppState } from '../..'

const name = 'spotify'

export const spotifySlice = createSlice({
  name,
  initialState: initialState as SpotifyState,
  reducers,
})

export const {
  setUserToken,
  clearSpotifyState,
  setActivePlaylist,
  setQueue,
  setUser,
  setPlaybackInfo,
  setCurrentTrack,
} = spotifySlice.actions

export const selectSpotifyState: (state: AppState) => SpotifyState = (state: AppState) =>
  state[name] as SpotifyState

export default spotifySlice.reducer
