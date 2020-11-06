import React from 'react'
import { PagingObject, SpotifyPlaylist } from '../../../../util/types/spotify'
import * as styles from './style.module.sass'

type PlaylistProps = {
  userPlaylists: PagingObject,
  selectPlaylist: (id: string) => void
}

export default function Playlists(props: PlaylistProps) {
  const { userPlaylists, selectPlaylist } = props
  return (
    <div className={styles.playlists}>
      {userPlaylists && (
        (userPlaylists.items as SpotifyPlaylist[]).map((playlist: SpotifyPlaylist) => (
          <button
            type="button"
            onClick={() => selectPlaylist(playlist.id)}
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
