const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
  bsn: Number, // huidige user
  streamer: String, // streamer die bekeken wordt
  timestamp: String, // de huidige timestamp
  message: String // inhoud
})

module.exports = mongoose.model('Chat', chatSchema)
