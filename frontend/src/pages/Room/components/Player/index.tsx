import React, {useEffect, useState} from 'react'
import loadScript from '../../../../util/spotify'

export default function Player() {
  const [player, setPlayer] = useState<any>()

  useEffect(() => {
    // window.onSpotifyWebPlaybackSDKReady = initializePlayer
    loadScript({
      defer: true,
      id: 'spotify-player',
      source: 'https://sdk.scdn.co/spotify-player.js',
    })
  }, [])
  
  return (
    <div>
      Player
    </div>
  )
}