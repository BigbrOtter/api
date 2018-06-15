const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
  bsn: Number, // huidige user
  streamer: Number, // streamer die bekeken wordt
  timestamp: {type: Date, default: Date.now}, // de huidige inhoud
  message: String // inhoud
})

module.exports = mongoose.model('Chat', chatSchema)
