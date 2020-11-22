import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
  clearSpotifyState, selectSpotifyState, setQueue, setUser,
} from '../../store/modules/spotify'
import { WebPlaybackTrack } from '../../util/types/spotify'
import {
  socket, Response, joinSocketRoom, sendQueue, leaveSocketRoom,
} from '../../util/websocket'
import Playlists from './components/Playlists'
import QueueList from './components/QueueList'
import TrackList from './components/TrackList'
import WebPlayer from './components/WebPlayer'
import { ReactComponent as DeleteAll } from '../../img/icons/delete.svg'
import { ReactComponent as ChatIcon } from '../../img/icons/chat.svg'
import * as styles from './styles.module.sass'
import Chat from './components/Chat'
import { getCurrentUserInfo } from '../../util/spotify'

export default function Room() {
  const dispatch = useDispatch()
  const { activePlaylist, token } = useSelector(selectSpotifyState)
  const [chatVisible, setChatVisible] = useState<Boolean>(false)

  const params = useParams<any>()
  const history = useHistory<any>()

  useEffect(() => {
    joinSocketRoom(params.id)

    // leave room if user closes browser/tab
    window.addEventListener('beforeunload', () => {
      leaveSocketRoom()
      return undefined
    })

    getCurrentUserInfo(token).then((res) => {
      dispatch(setUser(res))
    })

    socket.on('error-event', () => {
      dispatch(clearSpotifyState())
      history.push('/')
    })
    socket.on('room-info', (data: Response<WebPlaybackTrack[]>) => {
      console.log(data.message.payload)
      dispatch(setQueue(data.message.payload))
    })
    return () => {
      window.removeEventListener('beforeunload', () => {
        leaveSocketRoom()
        return undefined
      })
      leaveSocketRoom()
      socket.off('error-event')
      socket.off('room-info')
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.playlistContainer}>
        <h2 className={styles.title}>Playlists</h2>
        <div>
          <Playlists />
        </div>
      </div>
      <div className={styles.tracklistContainer}>
        <h2 className={styles.title}>Tracklist</h2>
        <div>
          {activePlaylist && <TrackList />}
        </div>
      </div>
      <div className={styles.queueContainer}>
        <div className={styles.title}>
          <h2>
            Queue
          </h2>
          <button className={styles.clearQueue} type="button" onClick={() => sendQueue([])}><DeleteAll /></button>
        </div>
        <div>
          <QueueList />
        </div>
      </div>
      <div className={`${styles.chatContainer} ${chatVisible ? styles.visible : ''}`}>
        <Chat />
      </div>
      <button type="button" className={styles.toggleChat} onClick={() => setChatVisible((prevState) => !prevState)}>
        <ChatIcon />
      </button>
      <WebPlayer />
    </div>
  )
}
