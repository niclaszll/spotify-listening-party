import React from 'react'
import { useHistory } from 'react-router-dom'
import { removeData } from '../../util/auth'
import * as styles from './style.module.sass'

export default function Navbar() {
  const history = useHistory()

  const handleClick = () => {
    removeData('spotifyAuthInfo')
    history.push('/')
  }
  return (
    <div className={styles.container}>
      <button type="button" onClick={handleClick}>
        End Session
      </button>
    </div>
  )
}
