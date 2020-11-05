import React from 'react'
import SpotifyLogo from '../../img/Spotify_Logo_RGB_Green.png'
import * as styles from './styles.module.sass'

export const authEndpoint = 'https://accounts.spotify.com/authorize'

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = process.env.REACT_APP_CLIENT_ID
const redirectUri = process.env.REACT_APP_REDIRECT_URL || 'http://localhost:3000/auth'
const scopes = [
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
]

export default function Login() {
  return (
    <div className={styles.container}>
      <div className={styles.spotifyLogo}>
        <div className={styles.imgWrapperDiv}>
          <img src={SpotifyLogo} alt="Spotify Logo" />
        </div>
      </div>

      <a
        href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`}
      >
        Connect with Spotify
      </a>
    </div>
  )
}
