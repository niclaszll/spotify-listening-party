import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { getData } from '../../util/auth'
import hash, { SpotifyAuthInfo } from '../../util/getHash'

export default function Auth() {
  const history = useHistory()

  useEffect(() => {
    hash()
    const spotifyAuth: SpotifyAuthInfo = getData(
      'spotifyAuthInfo',
    ) as SpotifyAuthInfo
    if (spotifyAuth.access_token) {
      history.push('/session')
    } else {
      history.push('/')
    }
  }, [])
  return (
    <div>Loading</div>
  )
}
