/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
import mongoose from 'mongoose'
import MongoMemory from 'mongodb-memory-server'

const mongod = new MongoMemory.MongoMemoryServer()

/**
 * Connect to the in-memory database.
 */
export async function connect() {
  const uri = await mongod.getConnectionString()

  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  }

  await mongoose.connect(uri, mongooseOpts)
}

/**
 * Drop database, close the connection and stop mongod.
 */
export async function closeDatabase() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongod.stop()
}

/**
 * Remove all the data for all db collections.
 */
export async function clearDatabase() {
  const {collections} = mongoose.connection

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}
