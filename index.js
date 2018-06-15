const express = require('express')
const mongoose = require('mongoose')
const NodeRSA = require('node-rsa')
const crypto = require('crypto')
const fs = require('fs')
const bodyparser = require('body-parser')
const dotenv = require('dotenv')

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

const User = require('./user.model')
const Chat = require('./chat.model')

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.get('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

/*
* Chat endpoints
*/

/* Maakt een nieuw chatbericht aan.
* @param {Number} steamer (BSN van welke transparant persoon je aan het bekijken bent)
* @param {String} message (plaintext chatbericht)
* @param {String} signature (encrypted met private key sha256-hash van de plaintext message)
* @param {String} cert (uitgegeven door TheCircle)
*/
app.post('/chat', (req, res) => {
  const cert = req.body.cert
  // Kijken of het certificaat geldig is, of het een user van TheCircle is.
  decryptCert(cert, readServerKey('public')).then((publicKey) => {
    User.findOne({public: publicKey}).then((user) => {
      // Kijken of de signature van de message geldig is, of het integer is.
      const signature = req.body.signature
      decryptSignature(signature, publicKey).then((hash1) => {
        const message = req.body.message
        const hash2 = crypto.createHash('sha256').update(message).digest('hex')
        // Kijken of de hash geldig is, als beide hashes gelijk zijn is het bericht integer.
        if(hash1 === hash2){
          const newChat = new Chat({
            bsn: user.bsn,
            streamer: req.body.streamer,
            timestamp: Math.floor(new Date() / 1000),
            message: message
          })
          newChat.save((err) => {
            if (err) throw err
            console.log(`Chat is added to the MongoDB.`)
          })
          res.status(200).json({status: 'OK', chat: newChat}).end()
        } else {
          res.status(400).json({error: `Hash van de message komt niet overeen met de signature.`}).end()
        }
      }).catch((error) => {
        console.log(error)
        res.status(400).json({error: `Signature '${signature}' is ongeldig, is niet te decrypted met de publicKey.`}).end()
      })
    }).catch((error) => {
      console.log(error)
      res.status(400).json({error: `PublicKey '${publicKey}' is ongeldig, hij is niet gekoppeld aan een User.`}).end()
    })
  }).catch((error) => {
    console.log(error)
    res.status(400).json({error: `Certificaat '${cert}' is ongeldig.`}).end()
  })
})

/*
* Geeft alle nieuw chats van een stream in JSON terug
* @param {String} cert (uitgegeven door TheCircle)
* @param {String} timestamp (timestamp van het laatste bericht dat je ontvangen hebt)
* @param {Number} streamer (BSN van welke transparant persoon je aan het bekijken bent)
*/
app.get('/chat', (req, res) => {
  const cert = req.headers.cert
  // Kijken of het certificaat geldig is, of het een user van TheCircle is.
  decryptCert(cert, readServerKey('public')).then((publicKey) => {
    // Chatberichten zoeken op basis van laatste timestamp vanuit de client
    const timestamp = req.headers.timestamp
    const streamer = parseInt(req.headers.streamer)
    Chat.aggregate([{$match:{streamer: streamer,timestamp: {$gt: timestamp}}},{$lookup: {from: 'users',localField: 'bsn',foreignField: 'bsn',as: 'user'}}]).then((chats) => {
      let chatArray = []
      chats.forEach((chat) => {
        chatArray.push({
          message: chat.message,
          timestamp: chat.timestamp,
          name: chat.user[0].naam
        })
      })
      res.status(200).json(chatArray).end()
    }).catch((error) => {
      console.log(error)
      res.status(400).json({error: `Geen nieuwe chats.`}).end()
    })
  }).catch((error) => {
    console.log(error)
    res.status(400).json({error: `Certificaat '${cert}' is ongeldig.`}).end()
  })
})

/*
* Cryprografie functies
*/

/*
* Decrypt de signature naar een hash
* @param {String} signature (encrypted sha256-hash met de private key)
* @param {String} publicKey (RSA public key waarmee de hash ontsleuteld wordt)
*/
const decryptSignature = (signature, publicKey) => {
  return new Promise(function(resolve, reject) {
    const objectPublicPem = new NodeRSA(publicKey)
    const decrypted = objectPublicPem.decryptPublic(signature, 'utf-8')
    resolve(decrypted)
  })
}

/*
* Maakt een digitale signature van data d.m.v. encryptie met de private key
* @param {String} data (plaintext data)
* @param {String} privateKey (RSA private key waarmee de data versleuteld wordt)
*/
const createSignature = (data, privateKey) => {
  return new Promise((resolve, reject) => {
    let hash = crypto.createHash('sha256').update(data).digest('hex')
    const objectPrivatePem = new NodeRSA(privateKey)
    const encrypted = objectPrivatePem.encryptPrivate(hash, 'base64')
    resolve(encrypted)
  })
}

/*
* Decrypt een certificaat om de public key te krijgen
* @param {String} cert (cerificicaat dat meegestuurd wordt)
* @param {String} publicKey (RSA public key waarmee het certificaat ontsleuteld wordt)
*/
const decryptCert = (cert, publicKey) => {
  return new Promise((resolve, reject) => {
    const objectPublicPem = new NodeRSA(publicKey)
    const decrypted = objectPublicPem.decryptPublic(cert, 'utf-8')
    resolve(decrypted)
  })
}

/*
* Leest de server keys uit van het bestand of de process environment variablen
* @param {String} type (private of public)
*/
const readServerKey = (type) => {
  const privateKey = process.env.privateKey || fs.readFileSync(`./certificate/private.pem`, {encoding: 'utf-8'})
  const publicKey = process.env.privateKey || fs.readFileSync(`./certificate/private.pem`, {encoding: 'utf-8'})
  return type === 'private' ? privateKey : publicKey
}

/*
* Start Express server
*/

const serverPort = process.env.PORT || 80
app.listen(serverPort, () => {
  console.log(`Server online op poort ${serverPort}, ${new Date()}`)
})
