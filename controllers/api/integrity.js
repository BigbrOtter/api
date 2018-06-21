const fs = require('fs')
const path = require('path')

function handlePost (req, res) {
  const streamID = req.body.streamID
  const timestamp = req.body.timestamp
  if (typeof streamID === 'undefined') {
    res.status(400).json({error: 'streamID is undefined'}).end()
    return
  }
  if (typeof timestamp === 'undefined') {
    res.status(400).json({error: 'timestamp is undefined'}).end()
    return
  }
  if (typeof req.body.signature === 'undefined') {
    res.status(400).json({error: 'signature is undefined'}).end()
    return
  }
  const folder = path.resolve(__dirname, '../../temp/')
  if (fs.existsSync(folder) === false) {
    fs.mkdirSync(folder)
  }
  const filename = path.resolve(__dirname, `../../temp/${streamID}.${timestamp}.json`)
  fs.writeFileSync(filename, JSON.stringify(req.body))
  res.status(200).json({'status': 'success'}).end()
}

function handleGet (req, res) {
  const file = req.params.file
  if (typeof file === 'undefined') {
    res.status(400).json({error: 'file is undefined'}).end()
    return
  }
  const filename = path.resolve(__dirname, `../../temp/${file}.json`)
  if (fs.existsSync(filename) === false) {
    res.status(400).json({error: 'file does not exist'}).end()
    return
  }
  const content = fs.readFileSync(filename, {encoding: 'utf8'})
  console.log(content)
  const signature = JSON.parse(content).signature
  console.log(signature)
  // fs.unlinkSync(filename)
  res.status(200).json({signature: signature}).end()
}

module.exports = { handlePost, handleGet }
