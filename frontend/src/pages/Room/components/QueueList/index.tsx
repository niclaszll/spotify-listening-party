import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSpotifyState, setQueue } from '../../../../store/modules/spotify'
import { WebPlaybackTrack } from '../../../../util/types/spotify'
import { Response, socket } from '../../../../util/websocket'
import Track from '../Track'

import * as styles from './styles.module.sass'

export default function QueueList() {
  const dispatch = useDispatch()
  const { queue } = useSelector(selectSpotifyState)

  useEffect(() => {
    socket.on('new-queue', (res: Response<WebPlaybackTrack[]>) => {
      dispatch(setQueue(res.message.payload))
    })
    return () => {
      socket.off('new-queue')
    }
  }, [])

  return (
    <div>
      {queue.length > 0 ? (
        queue.map((track, index) => (
          <div className={styles.track} key={index}>
            <Track track={track} />
          </div>
        ))
      ) : (
        <span className={styles.emptyQueue}>Queue is currently empty.</span>
      )}
    </div>
  )
}
