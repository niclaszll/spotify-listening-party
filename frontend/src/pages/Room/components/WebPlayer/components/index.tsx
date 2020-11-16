import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getTrackBackground, Range } from 'react-range'
import { NONAME } from 'dns'
import { selectSpotifyState } from '../../../../../store/modules/spotify'
import * as styles from './style.module.sass'
import { setVolume } from '../../../../../util/spotify'
import useDebouncedEffect from '../../../../../util/useDebouncedEffect'

import { ReactComponent as VolumeOff } from '../../../../../img/icons/volume_off.svg'
import { ReactComponent as VolumeDown } from '../../../../../img/icons/volume_down.svg'
import { ReactComponent as VolumeUp } from '../../../../../img/icons/volume_up.svg'

export default function VolumeControl() {
  const [values, setValues] = useState<number[]>([50])
  const { token, queue } = useSelector(selectSpotifyState)

  const setPlayerVolume = (volume: number) => {
    console.log('Set')
    setVolume(token, Math.round(volume))
  }

  useDebouncedEffect(() => setPlayerVolume(values[0]), 200, [values])

  const volumeIcon = () => {
    if (values[0] >= 50) {
      return <VolumeUp />
    } if (values[0] > 0) {
      return <VolumeDown />
    }
    return <VolumeOff />
  }

  return (
    <div className={styles.container}>
      {
        volumeIcon()
      }
      <Range
        step={1}
        min={0}
        max={100}
        values={values}
        onChange={(vals) => setValues(vals)}
        onFinalChange={(vals) => setPlayerVolume(vals[0])}
        renderTrack={({ props, children }) => (
          <div
            style={{
              ...props.style,
              height: '4px',
              width: '100%',
              cursor: 'auto',
            }}
          >
            <div
              ref={props.ref}
              className={styles.track}
              style={{
                height: '5px',
                width: '100%',
                borderRadius: '4px',
                background: getTrackBackground({
                  values,
                  colors: ['#54B560', '#404040'],
                  min: 0,
                  max: 100,
                }),
                alignSelf: 'center',
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            className={styles.thumb}
            style={{
              ...props.style,
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
