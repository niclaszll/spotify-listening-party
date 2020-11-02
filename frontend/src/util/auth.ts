export function storeData(data: any, key: string) {
  if (!window.localStorage || !window.JSON || !key) {
    return
  }
  localStorage.setItem(key, JSON.stringify(data))
}

export function getData(key: string): Object {
  if (!window.localStorage || !window.JSON || !key) {
    return {}
  }
  const item = localStorage.getItem(key)

  if (!item) {
    return {}
  }

  return JSON.parse(item)
}

export function removeData(key: string) {
  if (!window.localStorage || !window.JSON || !key) {
    return
  }
  localStorage.removeItem(key)
}
