import { PayloadAction } from '@reduxjs/toolkit'
import initialState, { SpotifyState } from './state'

export default {
  setUserToken(state: SpotifyState, action: PayloadAction<string>) {
    return { ...state, token: action.payload }
  },
  clearSpotifyState() {
    return { ...initialState }
  },
}
