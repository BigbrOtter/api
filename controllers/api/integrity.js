const fs = require('fs')
const path = require('path')

function handlePost (req, res) {

  // const streamID = req.body.streamID
  // const timestamp = req.body.timestamp
  const filename = path.resolve(__dirname, `../../temp/${req.params.file}.json`)
  fs.writeFileSync(filename, JSON.stringify(req.body))
  res.status(200).json({'status': 'success'}).end()
}

function handleGet (req, res) {
  const filename = path.resolve(__dirname, `../../temp/${req.params.file}.json`)
  if (fs.existsSync(filename) === false) {
    res.status(200).json({'status': 'nofile'}).end()
    return
  }
  const content = fs.readFileSync(filename, {encoding: 'utf8'})
  const signature = JSON.parse(content).signature
  fs.unlinkSync(filename)
  res.status(200).json({signature: signature}).end()
}

module.exports = { handlePost, handleGet }
