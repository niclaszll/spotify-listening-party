import {describe, expect, beforeAll, afterAll, afterEach, it} from '@jest/globals'

import {connect, clearDatabase, closeDatabase} from './db-handler.js'
import {createRoom, findRoomById, getAllRooms, updateRoom} from '../src/persistence/queries.js'

const validRoom = {
  id: 'room_0001',
  name: 'Valider Raum',
  roomPublic: true,
  roomPassword: '',
  activeListeners: [],
  queue: [],
  shuffledQueue: [],
  shuffled: false,
  creatorId: '1234',
  currentTrack: null,
}

const validRoom2 = {
  id: 'room_0002',
  name: 'Valider Raum',
  roomPublic: true,
  roomPassword: 'password',
  activeListeners: [],
  queue: [],
  shuffledQueue: [],
  shuffled: false,
  creatorId: '1234',
  currentTrack: null,
}

const invalidRoom1 = {
  id: 'room_0002',
  roomPublic: true,
  roomPassword: '',
  activeListeners: [],
  queue: [],
  shuffledQueue: [],
  shuffled: false,
  creatorId: 'tester',
  currentTrack: null,
}

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
  connect()
})

/**
 * Clear all test data after every test.
 */
afterEach(async () => clearDatabase())

/**
 * Remove and close the db and server.
 */
afterAll(async () => closeDatabase())

/**
 * Room test suite.
 */
describe('room ', () => {
  it('should retrive room correctly', async () => {
    await createRoom(validRoom)
    await createRoom(validRoom2)

    const foundRoom = await findRoomById('room_0001', true)
    expect(foundRoom.id).toBe(validRoom.id)
    expect(foundRoom.id).not.toBe(validRoom2.id)
  })

  it('should not create invalid room', async () => {
    try {
      await createRoom(invalidRoom1)
    } catch (e) {
      // should throw error
      expect(e._message).toMatch('Room validation failed')
    }
  })

  it('should retrive all rooms correctly', async () => {
    await createRoom(validRoom)
    await createRoom(validRoom2)

    const foundRooms = await getAllRooms()
    expect(foundRooms.length).toBe(2)
  })

  it('should update room correctly', async () => {
    await createRoom(validRoom)

    const newPassword = 'pw'
    const newShuffled = !validRoom.shuffled

    await updateRoom(validRoom.id, {shuffled: newShuffled, roomPassword: newPassword})
    const updatedRoom = await findRoomById(validRoom.id, true)

    expect(updatedRoom.shuffled).toBe(newShuffled)
    expect(updatedRoom.roomPassword).toBe(newPassword)
  })

  it('creatorId should not update if not empty string', async () => {
    await createRoom(validRoom)

    await updateRoom(validRoom.id, {creatorId: 'newUserName'})
    const updatedRoom = await findRoomById(validRoom.id)

    expect(updatedRoom.creatorId).toBe(validRoom.creatorId)
  })

  it('password projection should work correctly', async () => {
    await createRoom(validRoom)
    await createRoom(validRoom2)

    const roomWithPassword = await findRoomById(validRoom2.id, true)
    const roomWithoutPassword = await findRoomById(validRoom2.id)

    const allRoomsWithPassword = await getAllRooms(true)
    const allRoomsWithoutPassword = await getAllRooms()

    // for findRoomById
    expect(roomWithPassword.roomPassword).toBe(validRoom2.roomPassword)
    expect(roomWithoutPassword.roomPassword).toBe(undefined)

    // for getAllRooms
    expect(allRoomsWithPassword[0].roomPassword).toBe(validRoom.roomPassword)
    expect(allRoomsWithPassword[1].roomPassword).toBe(validRoom2.roomPassword)
    allRoomsWithoutPassword.forEach((room) => {
      expect(room.roomPassword).toBe(undefined)
    })
  })
})
