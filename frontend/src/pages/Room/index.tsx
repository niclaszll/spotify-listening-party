import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { removeData } from '../../util/auth'
import {
  socket, Response, sendMessage, joinSocketRoom,
} from '../../util/websocket'
import * as styles from './styles.module.sass'

export default function Room() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMsg, setNewMsg] = useState<string>()
  const params = useParams<any>()
  const history = useHistory<any>()

  useEffect(() => {
    joinSocketRoom(params.id)
    socket.on('error-event', () => {
      removeData('spotifyAuthInfo')
      history.push('/')
    })
    socket.on('room', (data: Response) => {
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
      <input value={newMsg} onChange={handleChange} />
      <button type="button" onClick={handleClick}>Send</button>
      <div>
        {messages.map((msg) => (
          <p>{msg}</p>
        ))}
      </div>
    </div>
  )
}
