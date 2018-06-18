const NodeRSA = require('node-rsa')
const crypto = require('crypto')
const fs = require('fs')

/*
* Decrypt de signature naar een hash
* @param {String} signature (encrypted sha256-hash met de private key)
* @param {String} publicKey (RSA public key waarmee de hash ontsleuteld wordt)
*/
const decryptSignature = (signature, publicKey) => {
  return new Promise(function (resolve, reject) {
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
    const decrypted = objectPublicPem.decryptPublic(cert, 'utf-8').catch((error)=>{
      reject(error)
    })
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

module.exports = { decryptCert, decryptSignature, createSignature, readServerKey }
