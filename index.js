const express = require('express')
const mongoose = require('mongoose')
const NodeRSA = require('node-rsa')
const crypto = require('crypto')
const fs = require('fs')
const bodyparser = require('body-parser')

const app = express()
const DBUSER = process.env.DBUSER || process.argv[2] || 'root'
const DBPASS = process.env.DBPASS || process.argv[3] || 'password'
const DBHOST = process.env.DBHOST || process.argv[4] || 'localhost'
const DBPORT = process.env.DBPORT || process.argv[5] || 5000
const DBNAME = process.env.DBNAME || process.argv[6] || 'mongodb'

mongoose.connect(`mongodb://${DBUSER}:${DBPASS}@${DBHOST}:${DBPORT}/${DBNAME}`)

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

// Maakt een nieuw chatbericht aan.
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
        if(hash1 === hash2){
          process.env.TZ = 'Europe/Amsterdam'
          const newChat = new Chat({
            bsn: user.bsn,
            streamer: req.body.streamer,
            timestamp: + new Date(), // unix timestamp
            message: message
          })
          newChat.save((err) => {
            if (err) throw err
            console.log(`Chat is added to the MongoDB.`)
          })
          res.status(200).json({status: 'OK'}).end()
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

app.get('/chat', (req, res) => {
  res.status(400).json({error: 'chat ophaal endpoint nog niet gerealiseerd.'}).end()
})

/*
* Authenticatie endpoints
*/

// DEBUG, deze is alleen voor onze test environment.
app.get('/register', (req, res) => {
  const bsn = req.headers.bsn || req.query.bsn
  const naam = req.headers.naam || req.query.naam
  if(typeof bsn === 'undefined' || typeof naam === 'undefined'){
    return res.status(200).json({
      error: 'bsn & naam zijn vereist.'
    }).end()
  }
  User.findOne({bsn: bsn}).then((user) => {
    console.log(`Found user '${naam}' with BSN '${bsn}' in the DB.`)
    res.status(200).json({
      private: user.private,
      cert: user.cert
    }).end()
  }).catch(() => {
    console.log(`Created new user '${naam} with BSN '${bsn}'`)
    createKey().then((keys) => {
      const cert = new NodeRSA(readServerKey('private')).encryptPrivate(keys.public, 'base64')
      const newUser = new User({
        bsn: bsn,
        naam: naam,
        private: keys.private,
        public: keys.public,
        cert: cert
      })
      newUser.save((err) => {
        if (err) throw err
        console.log(`user saved!`)
      })
      res.status(200).json({
        private: keys.private,
        cert: cert
      }).end()
    })
  })
})

/*
* Cryprografie functies
*/

// Decrypt de signature naar een hash
const decryptSignature = (signature, publicKey) => {
  return new Promise(function(resolve, reject) {
    const objectPublicPem = new NodeRSA(publicKey)
    const decrypted = objectPublicPem.decryptPublic(signature, 'utf-8')
    resolve(decrypted)
  })
}

// Maakt een digitale signature van data d.m.v. encryptie met de private key
const createSignature = (data, privateKey) => {
  return new Promise((resolve, reject) => {
    let hash = crypto.createHash('sha256').update(data).digest('hex')
    const objectPrivatePem = new NodeRSA(privateKey)
    const encrypted = objectPrivatePem.encryptPrivate(hash, 'base64')
    resolve(encrypted)
  })
}

// Decrypt een certificaat om de public key te krijgen
const decryptCert = (cert, publicKey) => {
  return new Promise((resolve, reject) => {
    const objectPublicPem = new NodeRSA(publicKey)
    const decrypted = objectPublicPem.decryptPublic(cert, 'utf-8')
    resolve(decrypted)
  })
}

// Maakt een RSA private & public key aan
const createKey = () => {
  return new Promise((resolve, reject) => {
    const key = new NodeRSA()
    key.generateKeyPair()
    const publicPem = key.exportKey('pkcs1-public-pem')
    const privatePem = key.exportKey('pkcs1-private-pem')
    resolve({
      private: privatePem,
      public: publicPem
    })
  })
}

// Leest de server keys
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
  console.log(`Server online op poort ${serverPort}`)
})
