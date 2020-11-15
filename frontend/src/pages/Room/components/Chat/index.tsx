import React, { useEffect, useState } from 'react'
import { socket, Response, sendMessage } from '../../../../util/websocket'
import * as styles from './style.module.sass'

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([])
  const [newMsg, setNewMsg] = useState<string>()

  useEffect(() => {
    socket.on('chat', (data: Response<string>) => {
      setMessages((oldMessages) => [...oldMessages, data.message.payload])
    })
    return () => {
      socket.off('chat')
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
  )
}
