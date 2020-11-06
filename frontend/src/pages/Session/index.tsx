import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Room } from '../../util/types/rooms'
import {
  getAvailableRooms,
  newSocketRoom, Response, socket,
} from '../../util/websocket'
import * as styles from './styles.module.sass'

export default function Session() {
  const [response, setResponse] = useState<Response<string>>({ source: '', message: { payload: '' } })
  const [roomName, setRoomName] = useState<string>('')
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const history = useHistory()

  useEffect(() => {
    getAvailableRooms()
    socket.on('room', (data: Response<string>) => {
      setResponse(data)
      history.push(`/room/${data.message.payload}`)
    })
    socket.on('available-rooms', (data: Response<Room[]>) => {
      setAvailableRooms(data.message.payload)
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

  const joinRoomViaInput = () => {
    if (roomName) {
      history.push(`/room/${roomName}`)
    }
  }

  const joinRoomViaList = (name: string) => {
    if (name) {
      history.push(`/room/${name}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e
    setRoomName(target.value)
  }

  return (
    <div className={styles.container}>
      <div className={styles.roomName}>
        <input value={roomName} onChange={handleChange} placeholder="Room name" />
      </div>
      <div className={styles.roomActions}>
        <button type="button" onClick={createRoom}>Create Room</button>
        <button type="button" onClick={joinRoomViaInput}>Join Room</button>
      </div>
      <h4>Available rooms</h4>
      <div className={styles.availableRoomsContainer}>
        {availableRooms.map((room) => <button key={room.id} type="button" className={styles.room} onClick={() => joinRoomViaList(room.id)}>{room.name}</button>)}
      </div>
    </div>
  )
}
