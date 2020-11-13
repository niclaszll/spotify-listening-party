import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { clearSpotifyState, selectSpotifyState, setQueue } from '../../store/modules/spotify'
import { WebPlaybackTrack } from '../../util/types/spotify'
import {
  socket, Response, sendMessage, joinSocketRoom, sendQueue,
} from '../../util/websocket'
import Playlists from './components/Playlists'
import QueueList from './components/QueueList'
import TrackList from './components/TrackList'
import WebPlayer from './components/WebPlayer'
import { ReactComponent as DeleteAll } from '../../img/icons/delete-white-18dp.svg'
import * as styles from './styles.module.sass'

export default function Room() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMsg, setNewMsg] = useState<string>()

  const dispatch = useDispatch()
  const { activePlaylist } = useSelector(selectSpotifyState)

  const params = useParams<any>()
  const history = useHistory<any>()

  useEffect(() => {
    joinSocketRoom(params.id)

    socket.on('error-event', () => {
      dispatch(clearSpotifyState())
      history.push('/')
    })
    socket.on('chat', (data: Response<string>) => {
      setMessages((oldMessages) => [...oldMessages, data.message.payload])
    })
    socket.on('room-info', (data: Response<WebPlaybackTrack[]>) => {
      console.log(data.message.payload)
      dispatch(setQueue(data.message.payload))
    })
    return () => {
      socket.off('error-event')
      socket.off('room')
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e
    setNewMsg(target.value)
  }

  const handleClick = () => {
    if (newMsg) {
      sendMessage(newMsg)
    }
  }

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
      <div className={styles.queueChatContainer}>
        <div>
          <h2 className={styles.title}>
            Queue
            <button type="button" onClick={() => sendQueue([])}><DeleteAll /></button>
          </h2>
          <div>
            <QueueList />
          </div>
        </div>
        <div>
          <h2 className={styles.title}>Chat</h2>
          <div className={styles.controls}>
            <input value={newMsg} onChange={handleChange} />
            <button type="button" onClick={handleClick}>Send</button>
          </div>
          <div>
            {messages.map((msg) => (
              <p>{msg}</p>
            ))}
          </div>
        </div>
      </div>
      <WebPlayer />
    </div>
  )
}
