const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const dotenv = require('dotenv')
const routes = require('./routes')

const app = express()
dotenv.config()
const DBUSER = process.env.DBUSER
const DBPASS = process.env.DBPASS
const DBHOST = process.env.DBHOST
const DBPORT = process.env.DBPORT
const DBNAME = process.env.DBNAME

mongoose.connect(`mongodb://${DBUSER}:${DBPASS}@${DBHOST}:${DBPORT}/${DBNAME}`).then(() => {
  console.log(`MongoDB successfully connected to: '${DBHOST}:${DBPORT}/${DBNAME}', ${new Date()}`)
}).catch((error) => {
  console.log(`MongoDB connection error to: '${DBHOST}:${DBPORT}/${DBNAME}', ${error.message}, ${new Date()}`)
})

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

// Routes
app.use('', routes)

app.get('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})
/*
* Start Express server
*/

const serverPort = process.env.PORT || 80
app.listen(serverPort, () => {
  console.log(`Server online op poort ${serverPort}, ${new Date()}`)
})
