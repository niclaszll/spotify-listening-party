import React, { useEffect, useState } from 'react'
import { getData } from '../../../../util/auth'
import { SpotifyAuthInfo } from '../../../../util/getHash'
import { loadScript, play } from '../../../../util/spotify'
import { SpotifyPlayerCallback, WebPlaybackPlayer } from '../../../../util/types/spotify'

export default function WebPlayer() {
  const [token, setToken] = useState<string>('')
  const [isInitializing, setIsInitializing] = useState<Boolean>(false)
  const [deviceId, setDeviceId] = useState<string>('')

  let player: WebPlaybackPlayer

  const initializePlayer = () => {
    setIsInitializing(true)

    const authInfo = getData('spotifyAuthInfo') as SpotifyAuthInfo
    // @ts-ignore
    player = new window.Spotify.Player({
      getOAuthToken: (cb: SpotifyPlayerCallback) => {
        cb(authInfo.access_token)
      },
      name: 'Spotify Web Player SCC',
    }) as WebPlaybackPlayer

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message) })
    player.addListener('authentication_error', ({ message }) => { console.error(message) })
    player.addListener('account_error', ({ message }) => { console.error(message) })
    player.addListener('playback_error', ({ message }) => { console.error(message) })

    // Playback status updates
    player.addListener('player_state_changed', (state) => { console.log(state) })

    // Ready
    player.addListener('ready', ({ device_id }) => {
      setDeviceId(device_id)
      console.log('Ready with Device ID', device_id)
    })

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
    })

    // Connect to the player!
    player.connect()
  }

  useEffect(() => {
    const authInfo = getData('spotifyAuthInfo') as SpotifyAuthInfo
    setToken(authInfo.access_token)
    // @ts-ignore
    window.onSpotifyWebPlaybackSDKReady = initializePlayer
    async function loadSpotify() {
      await loadScript({
        defer: true,
        id: 'spotify-player',
        source: 'https://sdk.scdn.co/spotify-player.js',
      })
    }
    loadSpotify()
  }, [])

  const playSong = async () => {
    await play(token, { context_uri: 'spotify:playlist:2fDhGP0CTTxrCDl4FLZUHt', deviceId })
  }

  return (
    <div>
      Player
      <button type="button" onClick={playSong}>Play</button>
    </div>
  )
}
