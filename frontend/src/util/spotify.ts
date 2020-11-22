import { SpotifyPlayOptions } from './types/spotify'

interface ScriptAttributes {
  async?: boolean;
  defer?: boolean;
  id?: string;
  source: string;
}

// load the spotify web playback sdk via script and make it accessible
export function loadScript(attributes: ScriptAttributes): Promise<any> {
  if (!attributes || !attributes.source) {
    throw new Error('Invalid attributes')
  }

  return new Promise((resolve, reject) => {
    const {
      async, defer, id, source,
    }: ScriptAttributes = {
      async: false,
      defer: false,
      ...attributes,
    }

    const scriptTag = document.getElementById('spotify-player')

    if (!scriptTag) {
      const script = document.createElement('script')

      script.id = id || 'spotify-player'
      script.type = 'text/javascript'
      script.async = async
      script.defer = defer
      script.src = source
      script.onload = () => resolve(undefined)
      script.onerror = (error: any) => reject(new Error(`createScript: ${error.message}`))

      document.head.appendChild(script)
    } else {
      resolve()
    }
  })
}

export async function play(
  token: string | null,
  {
    context_uri, deviceId, offset = 0, uris,
  }: SpotifyPlayOptions,
) {
  if (token === null) return false
  let body

  if (context_uri) {
    const isArtist = context_uri.indexOf('artist') >= 0
    let position

    if (!isArtist) {
      position = { position: offset }
    }

    body = JSON.stringify({ context_uri, offset: position })
  } else if (Array.isArray(uris) && uris.length) {
    body = JSON.stringify({ uris, offset: { position: offset } })
  }

  return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    body,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  })
}

export function pausePlayback(token: string | null) {
  if (token === null) return false
  return fetch('https://api.spotify.com/v1/me/player/pause', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  })
}

export function skipPlayback(token: string | null, deviceId: string) {
  if (token === null) return false
  return fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

export async function getPlaylists(token: string | null) {
  if (token === null) return false
  return fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then((res) => res.json())
}

export async function getPlaylistTracks(token: string | null, id: string) {
  if (token === null) return false
  return fetch(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then((res) => res.json())
}

export async function getCurrentUserInfo(token: string | null) {
  if (token === null) return false
  return fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then((res) => res.json())
}

export async function getPlaybackInfo(token: string | null) {
  if (token === null) return false
  return fetch('https://api.spotify.com/v1/me/player', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  }).then((res) => res.json())
}
