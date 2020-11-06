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
      <span>{track.name}</span>
      <button type="button" onClick={() => sendPlayUri(track.uri)}>Play</button>
    </div>
  )
}
