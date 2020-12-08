import React from 'react'
import { useSelector } from 'react-redux'
import { selectSpotifyState } from '../../../../store/modules/spotify'
import Track from '../Track'

import * as styles from './styles.module.sass'

export default function QueueList() {
  const { currentRoom } = useSelector(selectSpotifyState)

  return (
    <div>
      {currentRoom.queue.length > 0 ? (
        currentRoom.queue.map((track, index) => (
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
