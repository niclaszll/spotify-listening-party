import { storeData } from './auth'

export type SpotifyAuthInfo = {
  access_token: string,
  expires_in: string,
  token_type: string
}

export default function hash() {
  const spotifyAuthInfo: SpotifyAuthInfo = { access_token: '', expires_in: '', token_type: '' }
  window.location.hash
    .substring(1)
    .split('&')
    .forEach((item) => {
      if (item) {
        const parts: Array<string> = item.split('=')
        spotifyAuthInfo[parts[0] as keyof SpotifyAuthInfo] = decodeURIComponent(parts[1])
      }
    })

  storeData(spotifyAuthInfo, 'spotifyAuthInfo')
  window.location.hash = ''
}
