import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  newSocketRoom, Response, socket,
} from '../../util/websocket'
import * as styles from './style.module.sass'

export default function Session() {
  const [response, setResponse] = useState<Response>({ source: '', message: { payload: '' } })
  const [roomName, setRoomName] = useState<string>('')
  const history = useHistory()

  useEffect(() => {
    socket.on('room', (data: Response) => {
      setResponse(data)
      history.push(`/room/${data.message.payload}`)
    })
    return () => {
      socket.off('room')
    }
  }, [])

  const createRoom = () => {
    if (roomName) {
      newSocketRoom(roomName)
    }
  }

  const joinRoom = () => {
    if (roomName) {
      history.push(`/room/${roomName}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e
    setRoomName(target.value)
  }

  return (
    <div className={styles.container}>
      <div>
        <p>{response.message.payload}</p>
        <input value={roomName} onChange={handleChange} />
      </div>
      <div className={styles.roomDiv}>
        <button type="button" onClick={createRoom}>Create new Room</button>
      </div>
      <div className={styles.roomDiv}>
        <button type="button" onClick={joinRoom}>Join existing Room</button>
      </div>
    </div>
  )
}
