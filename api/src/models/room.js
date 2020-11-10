import mongoose from 'mongoose'

const RoomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  roomPublic: {
    type: Boolean,
    required: true,
    default: true,
  },
  active_listeners: {
    type: Number,
    required: true,
    default: 0,
  },
})

const Room = mongoose.model('Room', RoomSchema)

export default Room
