import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Room } from '../../util/types/rooms'
import {
  getAvailableRooms,
  newSocketRoom, Response, socket,
} from '../../util/websocket'
import { ReactComponent as Lock } from '../../img/icons/lock.svg'
import { ReactComponent as LockOpen } from '../../img/icons/lock_open.svg'
import { ReactComponent as People } from '../../img/icons/people.svg'
import * as styles from './styles.module.sass'

export default function Lobby() {
  const [roomName, setRoomName] = useState<string>('')
  const [roomPublic, setRoomPublic] = useState<Boolean>(true)

  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [visibleRooms, setVisibleRooms] = useState<Room[]>([])
  const history = useHistory()

  useEffect(() => {
    getAvailableRooms()
    socket.on('room', (data: Response<string>) => {
      history.push(`/room/${data.message.payload}`)
    })
    socket.on('available-rooms', (data: Response<Room[]>) => {
      setAvailableRooms(data.message.payload)
      setVisibleRooms(data.message.payload)
    })
    return () => {
      socket.off('room')
      socket.off('available-rooms')
    }
  }, [])

  const createRoom = () => {
    const newRoom = {
      name: roomName,
      roomPublic,
      activeListeners: 0,
    }
    if (roomName) {
      newSocketRoom(newRoom)
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
    if (target.value !== '') {
      setVisibleRooms(
        (previousState) => previousState.filter(
          (room) => room.name.toLowerCase().includes(target.value.toLowerCase()),
        ),
      )
    } else {
      setVisibleRooms(
        availableRooms,
      )
    }
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
        {visibleRooms.map(
          (room) => (
            <button key={room.id} type="button" className={styles.room} onClick={() => room.id && joinRoomViaList(room.id)}>
              <div className={styles.info}>
                <div className={styles.public}>{room.roomPublic ? <LockOpen /> : <Lock />}</div>
                <div className={styles.listeners}>
                  <People />
                  {' '}
                  {room.activeListeners}
                </div>
              </div>
              <div>{room.name}</div>
            </button>
          ),
        )}
      </div>
    </div>
  )
}
