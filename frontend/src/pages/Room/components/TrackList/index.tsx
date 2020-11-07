import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSpotifyState } from '../../../../store/modules/spotify'
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

  const { token } = useSelector(selectSpotifyState)

  /**
    * Fetch all tracks of selected playlist
    */
  const loadTrackList = async () => {
    const tracks = await getPlaylistTracks(token, id)
    setTracklist(tracks)
  }

  useEffect(() => {
    loadTrackList()
  }, [])

  return (
    <div className={styles.playlistTracks}>
      {tracklist && (
        (tracklist.items as SpotifyPlaylistTrackObject[]).map(
          (trackObject: SpotifyPlaylistTrackObject) => (
            <Track track={trackObject.track} />
          ),
        )
      )}
    </div>
  )
}
