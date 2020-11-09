import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSpotifyState } from '../../../../store/modules/spotify'
import { getPlaylistTracks } from '../../../../util/spotify'
import { PagingObject, SpotifyPlaylistTrackObject, WebPlaybackTrack } from '../../../../util/types/spotify'
import { sendQueue } from '../../../../util/websocket'
import Track from '../Track'
import * as styles from './style.module.sass'

export default function TrackList() {
  const [tracklist, setTracklist] = useState<PagingObject>()

  const { token, activePlaylist, queue } = useSelector(selectSpotifyState)

  /**
    * Fetch all tracks of selected playlist
    */
  const loadTrackList = async () => {
    const tracks = await getPlaylistTracks(token, activePlaylist!.id)
    setTracklist(tracks)
  }

  useEffect(() => {
    loadTrackList()
  }, [])

  const handleAdd = (track: WebPlaybackTrack) => {
    // get queue
    const q = queue.concat([track])
    sendQueue(q)
  }

  return (
    <div className={styles.playlistTracks}>
      {tracklist && (
        (tracklist.items as SpotifyPlaylistTrackObject[]).map(
          (trackObject: SpotifyPlaylistTrackObject) => (
            <>
              <Track key={trackObject.track.id} track={trackObject.track} />
              <button type="button" onClick={() => handleAdd(trackObject.track)}>Add</button>
            </>
          ),
        )
      )}
    </div>
  )
}
