const mongoose = require('mongoose')
const Schema = mongoose.Schema

const streamSchema = new Schema({
  key: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  url: String
}, {
  // We will set timestamps to true so mongoose assigns createdAt and updatedAt fields to our schema
  timestamps: true
})

module.exports = mongoose.model('Stream', streamSchema)
