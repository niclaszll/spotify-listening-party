import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { clearSpotifyState, selectSpotifyState } from '../../store/modules/spotify'
import { ReactComponent as ArrowBack } from '../../img/icons/arrow_back.svg'
import { ReactComponent as Share } from '../../img/icons/share.svg'
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

  const [open, setOpen] = React.useState(false)

  const handleTooltipClose = () => {
    setOpen(false)
  }

  const handleTooltipOpen = () => {
    setOpen(true)
  }

  const copyCurrentLinkToClipboard = () => {
    const helperElement = document.createElement('textarea')
    document.body.appendChild(helperElement)
    helperElement.value = window.location.href
    helperElement.select()
    document.execCommand('copy')
    document.body.removeChild(helperElement)
    handleTooltipOpen()
    setTimeout(() => {
      handleTooltipClose()
    }, 2000)
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
                  .map((listener, index) => (
                    <div key={listener + index} className={styles.listenerCircle} title={listener}>
                      {listener !== undefined ? listener.charAt(0).toUpperCase() : '?'}
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
                      {currentRoom.activeListeners
                        .filter((listener) => listener !== undefined)
                        .map((listener, index) => (
                          <div key={listener + index} title={listener}>
                            {listener}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Copied link to clipboard!"
              >
                <button
                  title="Copy Room Link"
                  onClick={copyCurrentLinkToClipboard}
                  className={styles.share}
                  type="button"
                >
                  <Share />
                </button>
              </Tooltip>
            </>
          )}
          <button className={styles.endSession} type="button" onClick={handleClick}>
            End Session
          </button>
        </div>
      )}
    </div>
  )
}
