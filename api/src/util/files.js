import fs from 'fs'
import {id} from './common.js'

export const dataPath = './src/data/rooms.json'
export const dataDir = './src/data'

export function readFile(callback, returnJson = false, filePath, encoding = 'utf8') {
  fs.readFile(filePath, encoding, (err, data) => {
    if (err) {
      throw err
    }

    callback(returnJson ? JSON.parse(data) : data)
  })
}

export function writeFile(fileData, callback, filePath, encoding = 'utf8') {
  fs.writeFile(filePath, fileData, encoding, (err) => {
    if (err) {
      throw err
    }

    callback()
  })
}

export function deleteFile(filePath, callback) {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err
    }

    callback()
  })
}

export function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

export function initDB() {
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
}
