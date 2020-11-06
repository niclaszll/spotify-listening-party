import React, { useEffect, useState } from 'react'
import { getData } from '../../../../util/auth'
import { SpotifyAuthInfo } from '../../../../util/getHash'
import { getPlaylistTracks } from '../../../../util/spotify'
import { PagingObject, SpotifyPlaylistTrackObject } from '../../../../util/types/spotify'
import { sendPlayUri } from '../../../../util/websocket'
import Track from '../Track'
import * as styles from './style.module.sass'

type TrackListProps = {
  id: string,
}

export default function TrackList(props: TrackListProps) {
  const [tracklist, setTracklist] = useState<PagingObject>()
  const { id } = props

  const loadTrackList = async () => {
    // fetch all tracks of selected playlist
    const authInfo = getData('spotifyAuthInfo') as SpotifyAuthInfo
    const tracks = await getPlaylistTracks(authInfo.access_token, id)
    setTracklist(tracks)
  }

  useEffect(() => {
    loadTrackList()
  }, [])

  return (
    <div className={styles.playlistTracks}>
      {tracklist && (
      // eslint-disable-next-line max-len
        (tracklist.items as SpotifyPlaylistTrackObject[]).map((trackObject: SpotifyPlaylistTrackObject) => (
          <Track track={trackObject.track} />
        ))
      )}
    </div>
  )
}
