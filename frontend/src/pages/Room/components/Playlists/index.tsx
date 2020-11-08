import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSpotifyState, setActivePlaylist } from '../../../../store/modules/spotify'
import { getPlaylists } from '../../../../util/spotify'
import { PagingObject, SpotifyPlaylist } from '../../../../util/types/spotify'
import * as styles from './style.module.sass'

export default function Playlists() {
  const [userPlaylists, setUserPlaylists] = useState<PagingObject>()
  const { token } = useSelector(selectSpotifyState)
  const dispatch = useDispatch()

  useEffect(() => {
    if (token !== null) {
      getPlaylists(token).then((res) => setUserPlaylists(res))
    }
  }, [])

  return (
    <div className={styles.playlists}>
      {userPlaylists && (
        (userPlaylists.items as SpotifyPlaylist[]).map((playlist: SpotifyPlaylist) => (
          <button
            key={playlist.id}
            type="button"
            onClick={() => dispatch(setActivePlaylist(playlist))}
            title={playlist.name}
          >
            <div className={styles.imgContainer}>
              <img src={playlist.images[0].url} alt={playlist.name} />
            </div>
          </button>
        ))
      )}
    </div>
  )
}
