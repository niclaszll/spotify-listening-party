import { createSlice } from '@reduxjs/toolkit'
import initialState, { SpotifyState } from './state'
import reducers from './reducers'

export const spotifySlice = createSlice({
  name: 'spotify',
  initialState: initialState as SpotifyState,
  reducers,
})

export const { setUserToken } = spotifySlice.actions

export default spotifySlice.reducer
