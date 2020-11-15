import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { clearSpotifyState, selectSpotifyState } from '../../store/modules/spotify'
import * as styles from './styles.module.sass'

export default function Navbar() {
  const history = useHistory()
  const dispatch = useDispatch()
  const { token } = useSelector(selectSpotifyState)

  const handleClick = () => {
    dispatch(clearSpotifyState())
    history.push('/')
  }
  return (
    <div className={styles.container}>
      { token !== null && (
      <button type="button" onClick={handleClick}>
        End Session
      </button>
      )}
    </div>
  )
}
