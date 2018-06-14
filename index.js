const express = require('express');
const app = express();

const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const fs = require('fs');

const User = require('./user.model')

app.get('/findPublicKey', (req, res) => {
  const bsn = req.headers.bsn
  User.findOne({bsn: bsn}).then((user) => {
    res.status(200).json({
      public: user.public
    }).end()
  }).catch(() => {
    res.status(400).json({
      error: `User with BSN '${bsn}' not found`
    }).end()
  })
})

app.get('/register', (req, res) => {
  const bsn = req.headers.bsn
  const naam = req.headers.naam
  User.findOne({bsn: bsn}).then((user) => {
    console.log(`Found user '${naam} with BSN '${bsn}' in the DB.`)
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

const serverPort = process.env.PORT || 80
app.listen(serverPort, () => {
  console.log(`Server online op poort ${serverPort}`)
})

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
