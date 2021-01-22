import {describe, expect, beforeAll, afterAll, afterEach, it} from '@jest/globals'

import {connect, clearDatabase, closeDatabase} from './db-handler.js'
import {createRoom, findRoomById} from '../src/persistence/queries.js'

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
  roomPassword: '',
  activeListeners: [],
  queue: [],
  shuffledQueue: [],
  shuffled: false,
  creatorId: '1234',
  currentTrack: null,
}

/**
 * Connect to a new in-memory database before running any tests.
 */
beforeAll(async () => {
  connect()
  await createRoom(validRoom)
  await createRoom(validRoom2)
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
  it('should retrive rooms correctly', async () => {
    const foundRoom = await findRoomById('room_0001', true)
    expect(foundRoom.id).toBe(validRoom.id)
    expect(foundRoom.id).not.toBe(validRoom2.id)
  })
})
