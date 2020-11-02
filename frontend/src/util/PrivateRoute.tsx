import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { getData } from './auth'
import { SpotifyAuthInfo } from './getHash'

export default function PrivateRoute({ component, ...rest }: any) {
  const spotifyAuth: SpotifyAuthInfo = getData(
    'spotifyAuthInfo',
  ) as SpotifyAuthInfo
  const routeComponent = (props: any) => (spotifyAuth.access_token ? (
    React.createElement(component, props)
  ) : (
    <Redirect to={{ pathname: '/' }} />
  ))
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Route {...rest} render={routeComponent} />
}
