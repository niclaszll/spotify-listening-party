import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { setUserToken } from '../../store/modules/spotify'
import { getData } from '../../util/auth'
import hash, { SpotifyAuthInfo } from '../../util/getHash'

export default function Auth() {
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    hash()
    const spotifyAuth = getData('spotifyAuthInfo') as SpotifyAuthInfo
    if (spotifyAuth.access_token) {
      dispatch(setUserToken(spotifyAuth.access_token))
      history.push('/lobby')
    } else {
      history.push('/')
    }
  }, [])
  return <div>Loading</div>
}
