/* eslint-disable max-len */
import React, { useEffect, useState } from 'react'
import { getData } from '../../../../util/auth'
import { SpotifyAuthInfo } from '../../../../util/getHash'
import {
  loadScript, pausePlayback, play,
} from '../../../../util/spotify'
import {
  PagingObject, SpotifyPlayerCallback, WebPlaybackPlayer,
} from '../../../../util/types/spotify'
import { socket, Response } from '../../../../util/websocket'
import * as styles from './style.module.sass'

type WebPlayerProps = {
  token: string,
}

export default function WebPlayer(props: WebPlayerProps) {
  const [isInitializing, setIsInitializing] = useState<Boolean>(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isPaused, setIsPaused] = useState<Boolean>(false)

  const { token } = props

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

  useEffect(() => {
    if (deviceId) {
      socket.on('play-song', (data: Response<string>) => {
        play(token, { uris: [data.message.payload], deviceId })
        setIsPaused(false)
      })
    }
    return () => {
      socket.off('play-song')
    }
  }, [deviceId])

  const pause = () => {
    pausePlayback(token)
    setIsPaused(true)
  }

  const resume = () => {
    play(token, { deviceId })
    setIsPaused(false)
  }

  return (
    <div className={styles.container}>
      {isPaused ? <button type="button" onClick={resume}>Resume</button> : <button type="button" onClick={pause}>Pause</button>}
    </div>
  )
}
