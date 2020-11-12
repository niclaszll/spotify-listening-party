import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSpotifyState, setQueue } from '../../../../store/modules/spotify'
import { WebPlaybackTrack } from '../../../../util/types/spotify'
import { Response, socket } from '../../../../util/websocket'
import Track from '../Track'

export default function QueueList() {
  const dispatch = useDispatch()
  const { queue } = useSelector(selectSpotifyState)

  useEffect(() => {
    socket.on('new-queue', (res: Response<WebPlaybackTrack[]>) => {
      dispatch(setQueue(res.message.payload))
    })
    return () => {
      socket.off('new-queue')
    }
  }, [])

  return (
    <div>{queue.map((t) => <Track key={t.uri} track={t} />)}</div>
  )
}
