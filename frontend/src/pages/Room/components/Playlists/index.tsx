import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSpotifyState, setActivePlaylist } from '../../../../store/modules/spotify'
import { getPlaylists } from '../../../../util/spotify'
import { PagingObject, SpotifyPlaylist } from '../../../../util/types/spotify'
import * as styles from './style.module.sass'

export default function Playlists() {
  const [userPlaylists, setUserPlaylists] = useState<PagingObject>()
  const { token, activePlaylist } = useSelector(selectSpotifyState)
  const dispatch = useDispatch()

  useEffect(() => {
    if (token !== null) {
      getPlaylists(token).then((res) => setUserPlaylists(res))
    }
  }, [])

  return (
    <div className={styles.playlists}>
      {(userPlaylists && userPlaylists.items) && (
        (userPlaylists.items as SpotifyPlaylist[]).map((playlist: SpotifyPlaylist, index) => (
          <div
            key={playlist.id}
            onClick={() => dispatch(setActivePlaylist(playlist))}
            // for accessibility
            onKeyDown={() => {}}
            title={playlist.name}
            className={`${styles.playlist} ${activePlaylist?.id === playlist.id && styles.active}`}
            role="button"
            tabIndex={index}
          >
            <div className={styles.imgContainer}>
              <img src={playlist.images[0]?.url} alt={playlist.name} />
            </div>
            <p>{playlist.name}</p>
          </div>
        ))
      )}
    </div>
  )
}
