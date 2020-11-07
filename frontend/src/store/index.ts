import { configureStore, combineReducers } from '@reduxjs/toolkit'
import spotifyReducer from './modules/spotify/index'

const rootReducer = combineReducers({
  spotify: spotifyReducer,
})

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
})

export type AppState = ReturnType<typeof rootReducer>

export default store
