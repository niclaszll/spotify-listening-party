import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectSpotifyState } from '../../../../store/modules/spotify'
import { getNextPagingObject, getPlaylistTracks } from '../../../../util/spotify'
import { PagingObject, SpotifyPlaylistTrackObject, WebPlaybackTrack } from '../../../../util/types/spotify'
import { sendQueue } from '../../../../util/websocket'
import Track from '../Track'
import * as styles from './style.module.sass'

const samplePagingObject = {
  href: '',
  items: [],
  limit: 0,
  next: '',
  offset: 0,
  previous: '',
  total: 0,
}

export default function TrackList() {
  const [tracklist, setTracklist] = useState<PagingObject>(samplePagingObject)
  const [isLoading, setIsLoading] = useState<Boolean>(true)

  const { token, activePlaylist, queue } = useSelector(selectSpotifyState)

  /**
    * Fetch all tracks of selected playlist
    */
  const loadTrackList = async () => {
    const tracks : PagingObject = await getPlaylistTracks(token, activePlaylist!.id)
    setIsLoading(true)
    setTracklist(tracks)
  }

  useEffect(() => {
    if (tracklist?.next !== null) {
      getNextPagingObject(tracklist.next, token, activePlaylist!.id).then((tracks) => {
        setTracklist((prevState) => (
          { ...prevState, next: tracks.next, items: [...prevState.items, ...tracks.items] }
        ))
      })
    } else {
      setIsLoading(false)
    }
  }, [tracklist])

  useEffect(() => {
    loadTrackList()
  }, [activePlaylist])

  const handleAdd = (track: WebPlaybackTrack) => {
    // get queue
    const q = queue.concat([track])
    sendQueue(q)
  }

  return (
    <div className={styles.tracks}>
      {(tracklist.items !== [] && !isLoading) ? (
        (tracklist.items as SpotifyPlaylistTrackObject[]).map(
          (trackObject: SpotifyPlaylistTrackObject, index) => (
            <div
              className={styles.track}
              key={index}
              onClick={() => handleAdd(trackObject.track)}
              onKeyDown={() => {}}
              role="button"
              tabIndex={index}
            >
              <Track key={trackObject.track.id} track={trackObject.track} />
            </div>
          ),
        )
      ) : <span className={styles.loadingIndicator} />}
    </div>
  )
}
