import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as Play } from '../../../../img/icons/play.svg'
import { ReactComponent as Pause } from '../../../../img/icons/pause.svg'
import { ReactComponent as SkipForward } from '../../../../img/icons/skip_next.svg'
import { ReactComponent as SkipBackward } from '../../../../img/icons/skip_previous.svg'
import { ReactComponent as Heart } from '../../../../img/icons/heart-shape-outline.svg'
import { ReactComponent as FilledHeart } from '../../../../img/icons/heart-shape-filled.svg'
import { selectSpotifyState, setPlaybackInfo } from '../../../../store/modules/spotify'
import {
  getPlaybackInfo,
  play,
  addToLibrary,
  isInLibrary,
  removeFromLibrary,
  loadSpotify,
  pausePlayback,
  seekPosition,
} from '../../../../util/spotify'
import {
  SpotifyPlayerCallback,
  WebPlaybackPlayer,
  WebPlaybackState,
} from '../../../../util/types/spotify'
import {
  socket,
  Response,
  sendSkipTrack,
  sendTogglePlay,
  sendQueue,
  sendCurrentTrack,
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

  const { token, playbackInfo, currentRoom } = useSelector(selectSpotifyState)
  const dispatch = useDispatch()

  /**
   * Initialize player state with token
   */
  const initializePlayer = () => {
    if (token === null) return

    setPlayer(
      // @ts-ignore
      new window.Spotify.Player({
        getOAuthToken: (cb: SpotifyPlayerCallback) => {
          cb(token)
        },
        name: 'Spotify Web Player SCC',
      })
    )
  }

  /**
   * ComponentDidMount
   * Load external spotify script and initialize player
   */
  useEffect(() => {
    // @ts-ignore
    window.onSpotifyWebPlaybackSDKReady = initializePlayer
    loadSpotify()
  }, [])

  useEffect(() => {
    // little trick to use await in the useEffect hook
    // async function handleAsyncPlay() {
    //   await play(token, { uris: [currentRoom.currentTrack!.uri], deviceId })
    // }
    // check if there is an active track in the room
    if (currentRoom.currentTrack && deviceId !== '') {
      console.log(playbackInfo)
      // if user joins room and gets first track or the new track is a different one
      // play the new track (https request to spotify)
      if (playbackInfo === null || playbackInfo.item.uri !== currentRoom.currentTrack.uri) {
        console.log('2')
        const position =
          Date.now() +
          currentRoom.currentTrack.position_ms -
          new Date(currentRoom.currentTrack.timestamp).getTime()
        play(token, { uris: [currentRoom.currentTrack.uri], deviceId }).then(() => {
          console.log('3')
          seekPosition(token, position, deviceId)
        })
      }
      // check if current track should be paused or resumed
      if (currentRoom.currentTrack.paused) {
        pausePlayback(token)
      } else {
        player?.resume()
      }
    }
  }, [currentRoom, deviceId])
  /**
   * Skip to the next track
   */
  const skipForward = () => {
    if (currentRoom.queue.length > 0 && player !== undefined) {
      const { uri, id } = currentRoom.queue[0]
      play(token, { uris: [uri], deviceId }).then((res: any) => {
        if (res.status === 204) {
          if (currentRoom.queue.length === 1) {
            sendQueue([])
          } else {
            const newQueue = currentRoom.queue.slice(1, currentRoom.queue.length)
            sendQueue(newQueue)
          }
          setEndOfTrack(false)
          setIsPaused(false)
        }
      })
    }
  }

  /**
   * Handle player state change
   * e.g. end of track
   */
  const handlePlayerStateChange = (state: WebPlaybackState) => {
    getPlaybackInfo(token).then((res) => dispatch(setPlaybackInfo(res)))
    isInLibrary(token, state.track_window.current_track.id).then((res) => {
      setIsLiked(res[0])
    })
    setPlaybackState(state)
    if (state.position === 0 && state.paused === true) {
      setEndOfTrack(true)
    }
  }

  /**
   * Add listeners when player is ready
   */
  useEffect(() => {
    if (player !== undefined) {
      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error(message)
      })
      player.addListener('authentication_error', ({ message }) => {
        console.error(message)
      })
      player.addListener('account_error', ({ message }) => {
        console.error(message)
      })
      player.addListener('playback_error', ({ message }) => {
        console.error(message)
      })

      // Playback status updates
      player.addListener('player_state_changed', (state) => {
        if (state) {
          handlePlayerStateChange(state)
          console.log(state)
        }
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
    return () => {
      player?.disconnect()
    }
  }, [player])

  /**
   * Skip to next track when end of track is reached
   * skipForward() needs to be called in useEffect, else wrong queue is used
   */
  useEffect(() => {
    if (endOfTrack) {
      skipForward()
    }
  }, [endOfTrack])

  /**
   * Setup socket connection and handler
   */
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

  /**
   * Auto-play song when no song is playing and song has been added to queue
   */
  // useEffect(() => {
  //   if (deviceId && currentTrack) {
  //     const position =
  //       Date.now() + currentTrack.position_ms - new Date(currentTrack.timestamp).getTime()
  //     play(token, { deviceId, uris: [currentTrack.uri] }).then(() => {
  //       seekPosition(token, position, deviceId).then(() => {
  //         if (currentTrack.paused) {
  //           pausePlayback(token)
  //           setIsPaused(true)
  //         } else {
  //           setIsPaused(false)
  //         }
  //       })
  //     })
  //   }
  // }, [deviceId, currentTrack])

  useEffect(() => {
    if (currentRoom.queue.length > 0 && playbackState === undefined) {
      sendCurrentTrack({ paused: false, position: 0, uri: currentRoom.queue[0].uri })
      skipForward()
    }
  }, [currentRoom.queue])

  /**
   * Handle pause/resume
   */
  useEffect(() => {
    if (player !== undefined) {
      if (isPaused) {
        player.pause()
      } else {
        player.resume()
      }
    }
  }, [isPaused])

  /**
   * Send toggle play command to backend
   */
  const togglePlay = () => {
    if (player !== undefined && playbackState !== undefined) {
      const { uri } = playbackState.track_window.current_track
      sendTogglePlay(!isPaused)
      sendCurrentTrack({ paused: !isPaused, position: playbackState.position, uri })
    }
  }

  /**
   * Handle click on skip forward button
   */
  const handleSkipForwardClick = () => {
    if (playbackState === undefined) {
      return false
    }
    // send skip command to backend
    if (currentRoom.queue.length > 0) {
      const { uri } = currentRoom.queue[0]
      sendSkipTrack()
      sendCurrentTrack({ paused: false, position: 0, uri })
      return true
    }
    return false
  }

  /**
   * Toggle song like
   */
  const toggleLikeSong = () => {
    console.log(playbackState)
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
          <div className={styles.name}>
            <a
              target="_blank"
              rel="noreferrer"
              href={playbackInfo?.item?.album.external_urls.spotify}
            >
              {playbackState?.track_window.current_track.name}
            </a>
            <button className={styles.likeSong} type="button" onClick={toggleLikeSong}>
              {playbackState?.track_window.current_track.id !== undefined ? (
                isLiked ? (
                  <FilledHeart />
                ) : (
                  <Heart />
                )
              ) : null}
            </button>
          </div>
          <div className={styles.artists}>
            {playbackState?.track_window.current_track.artists
              .map((artist) => artist.name)
              .join(', ')}
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button">
          <SkipBackward />
        </button>
        <button id={styles.playPause} type="button" onClick={togglePlay}>
          {currentRoom.currentTrack?.paused ? <Play /> : <Pause />}
        </button>
        <button type="button" onClick={handleSkipForwardClick}>
          <SkipForward />
        </button>
      </div>
      <div className={styles.additionalControls}>
        <VolumeControl player={player} />
      </div>
    </div>
  )
}
