import React, { useState } from 'react'
import { getTrackBackground, Range } from 'react-range'
import * as styles from './style.module.sass'
import useDebouncedEffect from '../../../../../../util/useDebouncedEffect'

import { ReactComponent as VolumeOff } from '../../../../../../img/icons/volume_off.svg'
import { ReactComponent as VolumeDown } from '../../../../../../img/icons/volume_down.svg'
import { ReactComponent as VolumeUp } from '../../../../../../img/icons/volume_up.svg'
import { WebPlaybackPlayer } from '../../../../../../util/types/spotify'

type VolumeControlProps = {
  player: WebPlaybackPlayer | undefined
}

export default function VolumeControl({ player }: VolumeControlProps) {
  const [values, setValues] = useState<number[]>([0.5])

  const setPlayerVolume = (volume: number) => {
    player?.setVolume(volume).then(() => {
      console.log('Volume updated!')
    })
  }

  useDebouncedEffect(() => setPlayerVolume(values[0]), 50, [values])

  const volumeIcon = () => {
    if (values[0] >= 0.5) {
      return <VolumeUp />
    }
    if (values[0] > 0) {
      return <VolumeDown />
    }
    return <VolumeOff />
  }

  return (
    <div className={styles.container}>
      {volumeIcon()}
      <Range
        step={0.01}
        min={0}
        max={1}
        values={values}
        onChange={(vals) => setValues(vals)}
        onFinalChange={(vals) => setPlayerVolume(vals[0])}
        renderTrack={(track) => (
          <div
            onMouseDown={track.props.onMouseDown}
            onTouchStart={track.props.onTouchStart}
            role="slider"
            aria-valuenow={values[0]}
            tabIndex={0}
            style={{
              ...track.props.style,
              height: '4px',
              width: '100%',
              cursor: 'auto',
            }}
          >
            <div
              ref={track.props.ref}
              className={styles.track}
              style={{
                height: '5px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#54B560', '#404040'],
                  min: 0,
                  max: 1,
                }),
                alignSelf: 'center',
              }}
            >
              {track.children}
            </div>
          </div>
        )}
        renderThumb={(thumb) => (
          <div
            {...thumb.props}
            className={styles.thumb}
            style={{
              ...thumb.props.style,
              height: '15px',
              width: '15px',
              borderRadius: '15px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              cursor: 'auto',
            }}
          />
        )}
      />
    </div>
  )
}
