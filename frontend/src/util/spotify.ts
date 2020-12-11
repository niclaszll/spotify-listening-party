import { SpotifyPlayOptions } from './types/spotify'

interface ScriptAttributes {
  async?: boolean
  defer?: boolean
  id?: string
  source: string
}

// load the spotify web playback sdk via script and make it accessible
export function loadScript(attributes: ScriptAttributes): Promise<any> {
  if (!attributes || !attributes.source) {
    throw new Error('Invalid attributes')
  }

  return new Promise((resolve, reject) => {
    const { async, defer, id, source }: ScriptAttributes = {
      async: false,
      defer: false,
      ...attributes,
    }

    const scriptTag = document.getElementById('spotify-player')

    if (scriptTag && scriptTag.parentNode) {
      scriptTag.parentNode.removeChild(scriptTag)
    }
    const script = document.createElement('script')
    script.id = id || 'spotify-player'
    script.type = 'text/javascript'
    script.async = async
    script.defer = defer
    script.src = source
    script.onload = () => resolve(undefined)
    script.onerror = (error: any) => reject(new Error(`createScript: ${error.message}`))

    document.head.appendChild(script)
  })
}

export async function loadSpotify() {
  await loadScript({
    defer: true,
    id: 'spotify-player',
    source: 'https://sdk.scdn.co/spotify-player.js',
  })
}

export async function play(
  token: string | null,
  { context_uri, deviceId, offset = 0, uris, position_ms = 0 }: SpotifyPlayOptions
) {
  if (token === null) return false
  let body

  if (context_uri) {
    const isArtist = context_uri.indexOf('artist') >= 0
    let position

    if (!isArtist) {
      position = { position: offset }
    }

    body = JSON.stringify({ context_uri, offset: position, position_ms })
  } else if (Array.isArray(uris) && uris.length) {
    body = JSON.stringify({ uris, offset: { position: offset }, position_ms })
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

export async function getNextPagingObject(url: string, token: string | null, id: string) {
  if (token === null) return false
  return fetch(url, {
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

export async function seekPosition(token: string | null, position: number, deviceId: string) {
  if (token === null) return false
  return fetch(
    `https://api.spotify.com/v1/me/player/seek?position_ms=${position}&device_id=${deviceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    }
  )
}

export async function addToLibrary(token: string | null, ids: Array<String>) {
  if (token === null) return false
  const body = JSON.stringify({ ids })
  return fetch('https://api.spotify.com/v1/me/tracks', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })
}

export async function removeFromLibrary(token: string | null, ids: Array<string>) {
  if (token === null) return false
  const body = JSON.stringify(ids)
  console.log(body)
  return fetch('https://api.spotify.com/v1/me/tracks', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })
}

export async function isInLibrary(token: string | null, ids: string | undefined) {
  if (token === null) return false
  return fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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
