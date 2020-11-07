import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Route } from 'react-router-dom'
import { selectSpotifyState } from '../../store/modules/spotify'

export default function PrivateRoute({ component, ...rest }: any) {
  const { token } = useSelector(selectSpotifyState)
  const routeComponent = (props: any) => (token ? (
    React.createElement(component, props)
  ) : (
    <Redirect to={{ pathname: '/' }} />
  ))
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Route {...rest} render={routeComponent} />
}
