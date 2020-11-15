export type Room = {
  id?: string,
  name: string
  roomPublic: Boolean,
  active_listeners: number
}

export type Message = {
  msg: string,
  user: string
}
