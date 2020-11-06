import React from 'react'
import { PagingObject, SpotifyPlaylistTrackObject } from '../../../../util/types/spotify'
import { sendPlayUri } from '../../../../util/websocket'
import Track from '../Track'
import * as styles from './style.module.sass'

type TrackListProps = {
  activePlaylistTracks: PagingObject,
}

export default function TrackList(props: TrackListProps) {
  const { activePlaylistTracks } = props

  return (
    <div className={styles.playlistTracks}>
      {activePlaylistTracks && (
      // eslint-disable-next-line max-len
        (activePlaylistTracks.items as SpotifyPlaylistTrackObject[]).map((trackObject: SpotifyPlaylistTrackObject) => (
          <Track track={trackObject.track} />
        ))
      )}
    </div>
  )
}
