import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as Play } from '../../../../img/icons/play.svg'
import { ReactComponent as Pause } from '../../../../img/icons/pause.svg'
import { ReactComponent as SkipForward } from '../../../../img/icons/skip_next.svg'
import { ReactComponent as SkipBackward } from '../../../../img/icons/skip_previous.svg'
import { selectSpotifyState, setQueue } from '../../../../store/modules/spotify'
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
  const [lastSkip, setLastSkip] = useState<number>(0)

  const { token, queue } = useSelector(selectSpotifyState)
  const dispatch = useDispatch()

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

  const skipForward = () => {
    console.log(queue)
    if (queue.length > 0 && player !== undefined) {
      const nextTrack = queue[0].uri
      play(token, { uris: [nextTrack], deviceId }).then((res: any) => {
        if (res.status === 204) {
          if (queue.length === 1) {
            dispatch(setQueue([]))
          } else {
            const newQueue = queue.slice(1, queue.length)
            dispatch(setQueue(newQueue))
          }
          setIsPaused(false)
        }
      })
    }
  }

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
          if (state.position === 0 && state.paused === true) {
            const timeDiff = state.timestamp - lastSkip
            if (timeDiff > 1000) {
              setLastSkip(state.timestamp)
            }
          }
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
    skipForward()
  }, [lastSkip])

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

  useEffect(() => {
    if (queue.length > 0 && playbackState === undefined) {
      skipForward()
    }
  }, [queue])

  const togglePlay = () => {
    if (player !== undefined) {
      player.togglePlay()
      setIsPaused((previousState) => !previousState)
    }
  }

  const handleSkipForwardClick = () => {
    if (playbackState === undefined) {
      return false
    }
    skipForward()
    return true
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
        <button type="button" onClick={handleSkipForwardClick}><SkipForward /></button>
      </div>
      <div className={styles.additionalControls}>
        <span>Volume Control</span>
      </div>
    </div>
  )
}
