import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getData, removeData } from '../../util/auth'
import { SpotifyAuthInfo } from '../../util/getHash'
import { getPlaylists, getPlaylistTracks } from '../../util/spotify'
import { PagingObject, SpotifyPlaylist } from '../../util/types/spotify'
import {
  socket, Response, sendMessage, joinSocketRoom,
} from '../../util/websocket'
import Playlists from './components/Playlists'
import TrackList from './components/TrackList'
import WebPlayer from './components/WebPlayer'
import * as styles from './styles.module.sass'

export default function Room() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMsg, setNewMsg] = useState<string>()

  const [token, setToken] = useState<string>('')
  const [userPlaylists, setUserPlaylists] = useState<PagingObject>()
  const [activePlaylistId, setActivePlaylistId] = useState<string>()

  const params = useParams<any>()
  const history = useHistory<any>()

  useEffect(() => {
    joinSocketRoom(params.id)

    const authInfo = getData('spotifyAuthInfo') as SpotifyAuthInfo
    setToken(authInfo.access_token)
    getPlaylists(authInfo.access_token).then((res) => setUserPlaylists(res))

    socket.on('error-event', () => {
      removeData('spotifyAuthInfo')
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

  const selectPlaylist = (id: string) => {
    setActivePlaylistId(id)
  }

  return (
    <div className={styles.container}>
      <input value={newMsg} onChange={handleChange} />
      <button type="button" onClick={handleClick}>Send</button>
      {userPlaylists && <Playlists userPlaylists={userPlaylists} selectPlaylist={selectPlaylist} />}
      {activePlaylistId && <TrackList id={activePlaylistId} />}
      <WebPlayer token={token} />
      <div>
        {messages.map((msg) => (
          <p>{msg}</p>
        ))}
      </div>
    </div>
  )
}
