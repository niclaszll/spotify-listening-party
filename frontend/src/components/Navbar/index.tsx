import React from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { clearSpotifyState } from '../../store/modules/spotify'
import * as styles from './styles.module.sass'

export default function Navbar() {
  const history = useHistory()
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(clearSpotifyState())
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
