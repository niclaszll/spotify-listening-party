import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  SkipBack, SkipForward, Play, Pause,
} from 'react-feather'
import { selectSpotifyState } from '../../../../store/modules/spotify'
import {
  loadScript, pausePlayback, play, skipPlayback,
} from '../../../../util/spotify'
import {
  PagingObject, SpotifyPlayerCallback, WebPlaybackPlayer,
} from '../../../../util/types/spotify'
import { socket, Response } from '../../../../util/websocket'
import * as styles from './style.module.sass'

export default function WebPlayer() {
  const [isInitializing, setIsInitializing] = useState<Boolean>(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isPaused, setIsPaused] = useState<Boolean>(false)
  const [player, setPlayer] = useState<WebPlaybackPlayer>()

  const { token } = useSelector(selectSpotifyState)

  // let player: WebPlaybackPlayer

  const initializePlayer = () => {
    if (token === null) return

    setIsInitializing(true)

    // @ts-ignore
    // player = new window.Spotify.Player({
    //   getOAuthToken: (cb: SpotifyPlayerCallback) => {
    //     cb(token)
    //   },
    //   name: 'Spotify Web Player SCC',
    // }) as WebPlaybackPlayer
    setPlayer(new window.Spotify.Player({
      getOAuthToken: (cb: SpotifyPlayerCallback) => {
        cb(token)
      },
      name: 'Spotify Web Player SCC',
    }))
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
    if (player !== undefined) {
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
  }, [player])

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
    if (player !== undefined) {
      player.pause()
      // pausePlayback(token)
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (player !== undefined) {
      player.togglePlay()
      // play(token, { deviceId })
      setIsPaused(false)
    }
  }

  const skipForward = () => {
    if (player !== undefined) {
      // skipPlayback(token, deviceId)
      player.nextTrack()
      setIsPaused(false)
    }
  }

  const skipBack = () => {
    if (player !== undefined) {
      player.previousTrack()
    }

    // TODO
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button type="button" onClick={skipBack}><SkipBack /></button>
        {isPaused ? <button id={styles.playPause} type="button" onClick={resume}><Play /></button> : <button id={styles.playPause} type="button" onClick={pause}><Pause /></button>}
        <button type="button" onClick={skipForward}><SkipForward /></button>
      </div>
    </div>
  )
}
