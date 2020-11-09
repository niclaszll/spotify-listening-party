import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ReactComponent as Play } from '../../../../img/icons/play.svg'
import { ReactComponent as Pause } from '../../../../img/icons/pause.svg'
import { ReactComponent as SkipForward } from '../../../../img/icons/skip_next.svg'
import { ReactComponent as SkipBackward } from '../../../../img/icons/skip_previous.svg'
import { selectSpotifyState } from '../../../../store/modules/spotify'
import {
  loadScript, pausePlayback, play, skipPlayback,
} from '../../../../util/spotify'
import {
  PagingObject, SpotifyPlayerCallback, WebPlaybackPlayer, WebPlaybackState, WebPlaybackTrack,
} from '../../../../util/types/spotify'
import { socket, Response } from '../../../../util/websocket'
import * as styles from './style.module.sass'

export default function WebPlayer() {
  const [isInitializing, setIsInitializing] = useState<Boolean>(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isPaused, setIsPaused] = useState<Boolean>(true)
  const [player, setPlayer] = useState<WebPlaybackPlayer>()
  const [playbackState, setPlaybackState] = useState<WebPlaybackState>()

  const { token } = useSelector(selectSpotifyState)

  const initializePlayer = () => {
    if (token === null) return

    setIsInitializing(true)

    // @ts-ignore
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
      player.addListener('player_state_changed', (state) => {
        if (state) {
          setPlaybackState(state)
        }
        console.log(state)
      })

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

  const togglePlay = () => {
    if (player !== undefined) {
      player.togglePlay()
      setIsPaused((previousState) => !previousState)
    }
  }

  const skipForward = () => {
    if (player !== undefined) {
      player.nextTrack()
      setIsPaused(false)
    }
  }

  const skipBack = () => {
    if (player !== undefined) {
      player.previousTrack()
      setIsPaused(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.songInfo}>
        {/* <div>
          <img src="" alt="Picture" />
        </div> */}
        <div>{playbackState?.track_window.current_track.name}</div>
        <div>
          {playbackState?.track_window.current_track.artists.map(
            (artist) => artist.name,
          ).join(', ')}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" onClick={skipBack}><SkipBackward /></button>
        <button id={styles.playPause} type="button" onClick={togglePlay}>
          { isPaused ? <Play /> : <Pause /> }
        </button>
        <button type="button" onClick={skipForward}><SkipForward /></button>
      </div>
      <div className={styles.additionalControls}>
        <span>Volume Control</span>
      </div>
    </div>
  )
}
