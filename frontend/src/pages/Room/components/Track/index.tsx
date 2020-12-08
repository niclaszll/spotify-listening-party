import React from 'react'
import { WebPlaybackTrack } from '../../../../util/types/spotify'
import * as styles from './style.module.sass'

type TrackProps = {
  track: WebPlaybackTrack
}

export default function Track(props: TrackProps) {
  const { track } = props

  return (
    <div className={styles.container}>
      <div className={styles.trackInfo}>
        <div>{track.name}</div>
        <div>{track.artists.map((artistObject) => artistObject.name).join(', ')}</div>
      </div>
    </div>
  )
}
