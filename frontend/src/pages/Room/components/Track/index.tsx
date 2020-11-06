import React from 'react'
import { SpotifyPlaylistTrackObject, WebPlaybackTrack } from '../../../../util/types/spotify'
import { sendPlayUri } from '../../../../util/websocket'
import * as styles from './style.module.sass'

type TrackProps = {
  track: WebPlaybackTrack,
}

export default function Track(props: TrackProps) {
  const { track } = props

  return (
    <div className={styles.container}>
      <div className={styles.trackInfo}>
        <div>{track.name}</div>
        <div>{track.artists.map((artistObject) => artistObject.name).join(', ')}</div>
      </div>

      <button type="button" onClick={() => sendPlayUri(track.uri)}>Play</button>
    </div>
  )
}
