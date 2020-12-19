import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, Link } from 'react-router-dom'
import { clearSpotifyState, selectSpotifyState } from '../../store/modules/spotify'
import { ReactComponent as ArrowBack } from '../../img/icons/arrow_back.svg'
import * as styles from './styles.module.sass'
import { ReactComponent as People } from '../../img/icons/people.svg'

export default function Navbar() {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()
  const [listenerDetailsOpen, setListenerDetailsOpen] = useState<Boolean>(false)
  const { token, currentRoom, user } = useSelector(selectSpotifyState)

  const handleClick = () => {
    dispatch(clearSpotifyState())
    history.push('/')
  }

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
        <div className={styles.right}>
          {location.pathname.startsWith('/room') && (
            <>
              <div className={styles.listeners}>
                <div className={styles.listenerCircle} title={user?.display_name}>
                  {user?.display_name.charAt(0).toUpperCase()}
                </div>
                {currentRoom.activeListeners
                  .filter((listener) => listener !== user?.display_name)
                  .slice(0, 2)
                  .map((listener) => (
                    <div className={styles.listenerCircle} title={listener}>
                      {listener.charAt(0).toUpperCase()}
                    </div>
                  ))}
                <div
                  className={styles.listenerCircle}
                  onClick={() => setListenerDetailsOpen(!listenerDetailsOpen)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => {}}
                >
                  <People />
                  {listenerDetailsOpen && (
                    <div className={styles.listenerDetails}>
                      {currentRoom.activeListeners.map((listener) => (
                        <div>{listener}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          <button type="button" onClick={handleClick}>
            End Session
          </button>
        </div>
      )}
    </div>
  )
}
