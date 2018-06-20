const mongoose = require('mongoose')
const Schema = mongoose.Schema

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: String, // de huidige timestamp
  activity: String // inhoud
})

module.exports = mongoose.model('Activity', activitySchema)
