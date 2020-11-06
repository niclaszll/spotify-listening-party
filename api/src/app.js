import express from 'express'
import cors from 'cors'
import socket from 'socket.io'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import http from 'http'
import dotenv from 'dotenv'
import debug from 'debug'
import roomRouter from './routes/room.js'
import {normalizePort} from './util/common.js'
import {initDB} from './util/files.js'

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
initDB()

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
