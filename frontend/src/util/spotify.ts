interface ScriptAttributes {
  async?: boolean;
  defer?: boolean;
  id?: string;
  source: string;
}

// load the spotify web playback sdk via script and make it accessible
export default function loadScript(attributes: ScriptAttributes): Promise<any> {
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
