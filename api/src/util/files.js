import fs from 'fs'

export const dataPath = './src/data/rooms.json'

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
