import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as Play } from '../../../../img/icons/play.svg'
import { ReactComponent as Pause } from '../../../../img/icons/pause.svg'
import { ReactComponent as SkipForward } from '../../../../img/icons/skip_next.svg'
import { ReactComponent as SkipBackward } from '../../../../img/icons/skip_previous.svg'
import { ReactComponent as Heart } from '../../../../img/icons/heart-shape-outline.svg'
import { ReactComponent as FilledHeart } from '../../../../img/icons/heart-shape-filled.svg'
import { selectSpotifyState, setPlaybackInfo, setQueue } from '../../../../store/modules/spotify'
import {
  getPlaybackInfo,
  loadScript, pausePlayback, play, skipPlayback, addToLibrary, isInLibrary, removeFromLibrary,
} from '../../../../util/spotify'
import {
  PagingObject, SpotifyPlayerCallback, WebPlaybackPlayer, WebPlaybackState, WebPlaybackTrack,
} from '../../../../util/types/spotify'
import {
  socket, Response, sendSkipTrack, sendTogglePlay, sendQueue,
} from '../../../../util/websocket'
import * as styles from './style.module.sass'
import VolumeControl from './components/VolumeControl'

export default function WebPlayer() {
  const [deviceId, setDeviceId] = useState<string>('')
  const [isPaused, setIsPaused] = useState<Boolean>(true)
  const [player, setPlayer] = useState<WebPlaybackPlayer>()
  const [playbackState, setPlaybackState] = useState<WebPlaybackState>()
  const [endOfTrack, setEndOfTrack] = useState<Boolean>(false)
  const [isLiked, setIsLiked] = useState<Boolean>()

  const { token, queue, playbackInfo } = useSelector(selectSpotifyState)
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
    if (queue.length > 0 && playbackState === undefined) {
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
    console.log(playbackState?.track_window.current_track.album)
  }, [isPaused])

  const togglePlay = () => {
    if (player !== undefined) {
      sendTogglePlay(!isPaused)
    }
  }

  const handleSkipForwardClick = () => {
    if (playbackState === undefined) {
      return false
    }
    // send skip command to backend
    sendSkipTrack()
    isInLibrary(token, playbackState?.track_window.current_track.id)
      .then((res) => { setIsLiked((res)[0]) })
    return true
  }

  const skipBack = () => {
    if (player !== undefined) {
      player.previousTrack()
    }
  }

  const likeSong = () => {
    if (playbackState?.track_window.current_track.id === undefined) {
      return false
    }
    const ids: string[] = [playbackState?.track_window.current_track.id]
    if (isLiked === true) {
      removeFromLibrary(token, ids)
      setIsLiked(false)
      return true
    }
    addToLibrary(token, ids)
    setIsLiked(true)
    return true
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
      <h4>
        <button className={styles.likeSong} type="button" onClick={likeSong}>
          { isLiked ? <FilledHeart /> : <Heart /> }
        </button>
      </h4>
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
