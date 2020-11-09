import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { clearSpotifyState, selectSpotifyState } from '../../store/modules/spotify'
import { getPlaylists } from '../../util/spotify'
import { PagingObject } from '../../util/types/spotify'
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
      <div>
        <input value={newMsg} onChange={handleChange} />
        <button type="button" onClick={handleClick}>Send</button>
        <Playlists />
        {activePlaylist && <TrackList />}
      </div>
      <div>
        <QueueList />
      </div>
      <WebPlayer />
      <div>
        {messages.map((msg) => (
          <p>{msg}</p>
        ))}
      </div>
    </div>
  )
}
