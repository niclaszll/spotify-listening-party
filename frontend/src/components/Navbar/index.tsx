import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, Link } from 'react-router-dom'
import { clearSpotifyState, selectSpotifyState } from '../../store/modules/spotify'
import { ReactComponent as ArrowBack } from '../../img/icons/arrow_back.svg'
import * as styles from './styles.module.sass'

export default function Navbar() {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const { token } = useSelector(selectSpotifyState)

  const handleClick = () => {
    dispatch(clearSpotifyState())
    history.push('/')
  }

  useEffect(() => {
    console.log(location)
  }, [location])

  return (
    <div className={styles.container}>
      {location.pathname.startsWith('/room') ? (
        <Link className={styles.goBack} type="button" to="/lobby">
          <ArrowBack />
          <span>Back to lobby</span>
        </Link>
      ) : (
        <div />
      )}
      {token !== null && (
        <button type="button" onClick={handleClick}>
          End Session
        </button>
      )}
    </div>
  )
}
