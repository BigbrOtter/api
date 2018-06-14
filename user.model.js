const mongoose = require('mongoose')

const user = process.env.DBUSER || 'root'
const pass = process.env.DBPASS || 'password'
const host = process.env.DBHOST || 'localhost'
const port = process.env.DBPORT || 5000
const dbname = process.env.DBNAME || 'mongodb'

mongoose.connect(`mongodb://${user}:${pass}@${host}:${port}/${dbname}`)
const Schema = mongoose.Schema

const userSchema = new Schema({
  bsn: String,
  naam: String,
  private: String,
  public: String,
  cert: String
})

module.exports = mongoose.model('User', userSchema)
