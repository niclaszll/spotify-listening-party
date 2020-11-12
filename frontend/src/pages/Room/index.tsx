import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { clearSpotifyState, selectSpotifyState } from '../../store/modules/spotify'
import {
  socket, Response, sendMessage, joinSocketRoom,
} from '../../util/websocket'
import Playlists from './components/Playlists'
import QueueList from './components/QueueList'
import TrackList from './components/TrackList'
import WebPlayer from './components/WebPlayer'
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
    socket.on('room', (data: Response<string>) => {
      setMessages((oldMessages) => [...oldMessages, data.message.payload])
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
        <h2>Playlists</h2>
        <Playlists />
      </div>
      <div className={styles.tracklistContainer}>
        <h2>Tracklist</h2>
        {activePlaylist && <TrackList />}
      </div>
      <div className={styles.queueChatContainer}>
        <div>
          <h2>Queue</h2>
          <QueueList />
        </div>
        <div>
          <h2>Chat</h2>
          <input value={newMsg} onChange={handleChange} />
          <button type="button" onClick={handleClick}>Send</button>
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
