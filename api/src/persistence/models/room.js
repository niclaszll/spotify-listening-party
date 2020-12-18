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
  activeListeners: {
    type: Array,
    required: true,
    default: [],
  },
  queue: {
    type: Array,
    required: true,
    default: [],
  },
  creatorId: {
    type: String,
    required: true,
    default: '',
    immutable: (doc) => doc.creatorId !== '',
  },
  currentTrack: {
    type: Object,
    required: false,
    default: null,
  },
})

const Room = mongoose.model('Room', RoomSchema)

export default Room
