import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { current } from '@reduxjs/toolkit'
import { off } from 'process'
import { ReactComponent as Play } from '../../../../img/icons/play.svg'
import { ReactComponent as Pause } from '../../../../img/icons/pause.svg'
import { ReactComponent as SkipForward } from '../../../../img/icons/skip_next.svg'
import { ReactComponent as SkipBackward } from '../../../../img/icons/skip_previous.svg'
import { selectSpotifyState, setPlaybackInfo, setQueue } from '../../../../store/modules/spotify'
import {
  getPlaybackInfo,
  loadScript, pausePlayback, play, skipPlayback, seekPosition,
} from '../../../../util/spotify'
import {
  PagingObject, SpotifyPlayerCallback, WebPlaybackPlayer, WebPlaybackState,
} from '../../../../util/types/spotify'
import {
  socket, Response, sendSkipTrack, sendTogglePlay, sendQueue, sendCurrentTrack,
} from '../../../../util/websocket'
import * as styles from './style.module.sass'
import VolumeControl from './components/VolumeControl'

export default function WebPlayer() {
  const [deviceId, setDeviceId] = useState<string>('')
  const [isPaused, setIsPaused] = useState<Boolean>(true)
  const [player, setPlayer] = useState<WebPlaybackPlayer>()
  const [playbackState, setPlaybackState] = useState<WebPlaybackState>()
  const [endOfTrack, setEndOfTrack] = useState<Boolean>(false)

  const {
    token, queue, playbackInfo, currentTrack,
  } = useSelector(selectSpotifyState)
  const dispatch = useDispatch()

  const initializePlayer = () => {
    if (token === null) return

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
    if (queue.length > 0 && player !== undefined) {
      const nextTrack = queue[0].uri
      play(token, { uris: [nextTrack], deviceId }).then((res: any) => {
        if (res.status === 204) {
          if (queue.length === 1) {
            sendQueue([])
          } else {
            const newQueue = queue.slice(1, queue.length)
            sendQueue(newQueue)
          }
          setEndOfTrack(false)
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
          getPlaybackInfo(token).then(
            (res) => (
              dispatch(setPlaybackInfo(res))
            ),
          )
          setPlaybackState(state)
          if (state.position === 0 && state.paused === true) {
            setEndOfTrack(true)
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
    if (endOfTrack) {
      skipForward()
    }
  }, [endOfTrack])

  useEffect(() => {
    if (deviceId) {
      socket.on('play-song', (data: Response<string>) => {
        play(token, { uris: [data.message.payload], deviceId })
        setIsPaused(false)
      })
      socket.on('skip-forward', () => {
        setEndOfTrack(true)
      })
      socket.on('toggle-play', (data: Response<Boolean>) => {
        setIsPaused(data.message.payload)
      })
    }
    return () => {
      socket.off('play-song')
      socket.off('skip-forward')
      socket.off('toggle-play')
    }
  }, [deviceId])

  useEffect(() => {
    if (deviceId && currentTrack) {
      const position = Date.now() + currentTrack.position_ms
      - new Date(currentTrack.timestamp).getTime()
      play(token, { deviceId, uris: [currentTrack.uri] }).then(() => {
        seekPosition(token, position, deviceId)
        // TODO: move somewhere else/refactor? right now its buggy and not working as intended
        // Problem: when fetching the current track of the room and sending the play request
        // we need to set the isPaused state to true (if track in the room is currently paused)
        // or false. but atm when it is paused, the player.pause() function gets called to soon
        // and the track hasnt even started -> so it cant be paused and is played after
        if (currentTrack.paused) {
          setIsPaused(true)
        } else {
          setIsPaused(false)
        }
      })
    }
  }, [deviceId, currentTrack])

  useEffect(() => {
    if (queue.length > 0 && playbackState === undefined) {
      sendCurrentTrack({ paused: false, position: 0, uri: queue[0].uri })
      skipForward()
    }
  }, [queue])

  useEffect(() => {
    if (player !== undefined) {
      if (isPaused) {
        player.pause()
      } else {
        player.resume()
      }
    }
  }, [isPaused])

  const togglePlay = () => {
    if (player !== undefined && playbackState !== undefined) {
      const { uri } = playbackState.track_window.current_track
      sendTogglePlay(!isPaused)
      sendCurrentTrack({ paused: !isPaused, position: playbackState.position, uri })
    }
  }

  const handleSkipForwardClick = () => {
    if (playbackState === undefined) {
      return false
    }
    // send skip command to backend
    const { uri } = queue[0]
    sendSkipTrack()
    sendCurrentTrack({ paused: false, position: 0, uri })
    return true
  }

  const skipBack = () => {
    if (player !== undefined) {
      player.previousTrack()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.song}>
        <div className={styles.thumbnail}>
          <img src={playbackState?.track_window.current_track.album.images[0].url} alt="" />
        </div>
        <div className={styles.songInfo}>
          <a
            target="_blank"
            rel="noreferrer"
            href={playbackInfo?.item.album.external_urls.spotify}
            className={styles.name}
          >
            {playbackState?.track_window.current_track.name}
          </a>
          <div className={styles.artists}>
            {playbackState?.track_window.current_track.artists.map(
              (artist) => artist.name,
            ).join(', ')}
          </div>
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
        <VolumeControl player={player} />
      </div>
    </div>
  )
}
