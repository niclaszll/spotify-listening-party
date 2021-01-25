import React from 'react'
import { useSelector } from 'react-redux'
import { selectSpotifyState } from '../../../../store/modules/spotify'
import { WebPlaybackTrack } from '../../../../util/types/spotify'
import * as styles from './style.module.sass'

type TrackProps = {
  track: WebPlaybackTrack
}

export default function Track(props: TrackProps) {
  const { track } = props

  const { playbackInfo } = useSelector(selectSpotifyState)

  const formattedDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60)) % 60
    const seconds = Math.floor(duration / 1000) % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles.trackInfo} ${playbackInfo?.item.id === track.id && styles.playing}`}
      >
        <div className={styles.left}>
          <div>{track.name}</div>
          <div>{track.artists.map((artistObject) => artistObject.name).join(', ')}</div>
        </div>
        <div className={styles.right}>
          <div>{formattedDuration(track.duration_ms)}</div>
        </div>
      </div>
    </div>
  )
}
