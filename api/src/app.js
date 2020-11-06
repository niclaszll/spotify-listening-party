import express from 'express'
import cors from 'cors'
import socket from 'socket.io'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import http from 'http'
import dotenv from 'dotenv'
import debug from 'debug'
import roomRouter from './routes/room.js'
import {normalizePort, id} from './util/common.js'
import {createDir, writeFile, dataPath, dataDir} from './util/files.js'

/**
 * Setup stuff
 */

dotenv.config()
debug('api:server')

const app = express()
const server = http.createServer(app)
const io = socket(server, {pingTimeout: 60000})
const rr = roomRouter(io)

/**
 * Reset "DB" on startup
 */

createDir(dataDir)

const boilerPlateRooms = {}

Array.from({length: 5}, (x, i) => {
  const boilerPlateRoomId = `room${id()}`
  boilerPlateRooms[boilerPlateRoomId] = {id: boilerPlateRoomId, name: `Raum ${i}`}
  return i
})

writeFile(
  JSON.stringify(boilerPlateRooms, null, 2),
  () => {
    console.log('reset rooms.json')
  },
  dataPath
)

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.API_PORT || '8000')
app.set('port', port)

/**
 * Setup middleware
 */
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use('/room', rr)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
