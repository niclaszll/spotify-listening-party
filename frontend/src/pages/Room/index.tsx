import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
  clearCurrentRoom,
  clearPlaybackInfo,
  clearSpotifyState,
  selectSpotifyState,
  setCurrentRoom,
  setUser,
} from '../../store/modules/spotify'
import {
  socket,
  Response,
  joinSocketRoom,
  leaveSocketRoom,
  clearQueue,
  checkIfRoomIsPrivate,
} from '../../util/websocket'
import Playlists from './components/Playlists'
import QueueList from './components/QueueList'
import TrackList from './components/TrackList'
import WebPlayer from './components/WebPlayer'
import PasswordDialog from './components/PasswordDialog'
import { ReactComponent as DeleteAll } from '../../img/icons/delete.svg'
import { ReactComponent as ChatIcon } from '../../img/icons/chat.svg'
import * as styles from './styles.module.sass'
import Chat from './components/Chat'
import { getCurrentUserInfo } from '../../util/spotify'
import { Room as CurrentRoom } from '../../util/types/rooms'

export default function Room() {
  const dispatch = useDispatch()
  const { activePlaylist, token, currentRoom, user } = useSelector(selectSpotifyState)
  const [chatVisible, setChatVisible] = useState<Boolean>(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false)

  const params = useParams<any>()
  const history = useHistory<any>()

  const togglePasswordDialog = (open: boolean) => {
    setPasswordDialogOpen(open)
  }

  const backUpUserName = `Anonymous_${Math.floor(Math.random() * (1000 - 0)) + 0}`

  useEffect(() => {
    getCurrentUserInfo(token)
      .then((res) => {
        dispatch(setUser(res))
      })
      .then(() => {
        checkIfRoomIsPrivate(params.id)
      })

    // leave room if user closes browser/tab
    window.addEventListener('beforeunload', () => {
      dispatch(clearCurrentRoom())
      dispatch(clearPlaybackInfo())
      leaveSocketRoom(user?.display_name || backUpUserName)
      return undefined
    })

    socket.on('check-private', (data: Response<boolean>) => {
      if (data.message.payload) {
        joinSocketRoom(params.id, user?.display_name || backUpUserName)
      } else {
        setPasswordDialogOpen(true)
      }
    })

    socket.on('password-correct', (data: Response<boolean>) => {
      if (data.message.payload) {
        setPasswordDialogOpen(false)
      } else {
        history.push('/lobby')
      }
    })

    socket.on('error-event', () => {
      dispatch(clearSpotifyState())
      history.push('/')
    })
    socket.on('room-full-info', (data: Response<CurrentRoom>) => {
      setPasswordDialogOpen(false)
      dispatch(setCurrentRoom(data.message.payload))
    })
    return () => {
      window.removeEventListener('beforeunload', () => {
        dispatch(clearCurrentRoom())
        dispatch(clearPlaybackInfo())
        leaveSocketRoom(user?.display_name || backUpUserName)
        return undefined
      })
      dispatch(clearCurrentRoom())
      dispatch(clearPlaybackInfo())
      leaveSocketRoom(user?.display_name || backUpUserName)
      socket.off('error-event')
      socket.off('room-info')
      socket.off('room-full-info')
      socket.off('check-private')
      socket.off('password-correct')
    }
  }, [])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.playlistContainer}>
          <h2 className={styles.title}>Playlists</h2>
          <div>
            <Playlists />
          </div>
        </div>
        <div className={styles.tracklistContainer}>
          <h2 className={styles.title}>Tracklist</h2>
          <div>{activePlaylist && <TrackList />}</div>
        </div>
        <div className={styles.queueContainer}>
          <div className={styles.title}>
            <h2>Queue</h2>
            <button
              className={styles.clearQueue}
              type="button"
              onClick={() => clearQueue(currentRoom.id!)}
            >
              <DeleteAll />
            </button>
          </div>
          <div>
            <QueueList />
          </div>
        </div>
        <div className={`${styles.chatContainer} ${chatVisible ? styles.visible : ''}`}>
          <Chat />
        </div>
        <button
          type="button"
          className={styles.toggleChat}
          onClick={() => setChatVisible((prevState) => !prevState)}
        >
          <ChatIcon />
        </button>
        <WebPlayer />
      </div>
      <PasswordDialog
        open={passwordDialogOpen}
        togglePasswordDialog={() => togglePasswordDialog(passwordDialogOpen)}
        checkPassword={(password) => {
          return joinSocketRoom(params.id, user?.display_name || backUpUserName, password)
        }}
      />
    </>
  )
}
