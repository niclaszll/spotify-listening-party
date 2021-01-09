import RoomModel from './models/room.js'

export async function getAllRooms(projectPassword = false) {
  if (projectPassword) {
    return RoomModel.find({}, '+roomPassword')
  }
  return RoomModel.find({})
}

export async function createRoom(newRoom) {
  const room = new RoomModel(newRoom)
  return room.save()
}

export async function findRoomById(roomId, projectPassword = false) {
  if (projectPassword) {
    return RoomModel.findOne({id: roomId}, '+roomPassword')
  }
  return RoomModel.findOne({id: roomId})
}

export async function updateRoom(roomId, updatedParams) {
  return RoomModel.updateOne({id: roomId}, updatedParams, (err) => {
    if (err) {
      console.log(err)
    }
  })
}
