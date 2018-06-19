const crypto = require('crypto')
const { decryptCert, decryptSignature, readServerKey, createSignature } = require('../../utils/cryptographic')
const { User, Chat } = require('../../models')

/* Maakt een nieuw chatbericht aan.
 * @param {Number} steamer (BSN van welke transparant persoon je aan het bekijken bent)
 * @param {String} message (plaintext chatbericht)
 * @param {String} signature (encrypted met private key sha256-hash van de plaintext message)
 * @param {String} cert (uitgegeven door TheCircle)
 */
function postChat (req, res) {
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
        if (hash1 === hash2) {
          const newChat = new Chat({
            bsn: user.bsn,
            streamer: req.body.streamer,
            timestamp: Math.floor(new Date() / 1000),
            message: message
          })
          newChat.save((err) => {
            if (err) throw err
          })
          console.log(`OK, ${newChat}`)
          res.status(200).json({status: 'OK', chat: newChat}).end()
        } else {
          console.log(`Hash van de message komt niet overeen met de signature.`)
          res.status(400).json({error: `Hash van de message komt niet overeen met de signature.`}).end()
        }
      }).catch((error) => {
        console.log(`Signature '${signature}' is ongeldig, is niet te decrypted met de publicKey.`)
        res.status(400).json({error: `Signature '${signature}' is ongeldig, is niet te decrypted met de publicKey.`}).end()
      })
    }).catch((error) => {
      console.log(`PublicKey '${publicKey}' is ongeldig, hij is niet gekoppeld aan een User.`)
      res.status(400).json({error: `PublicKey '${publicKey}' is ongeldig, hij is niet gekoppeld aan een User.`}).end()
    })
  }).catch((error) => {
    console.log(`Certificaat '${cert}' is ongeldig.`)
    res.status(400).json({error: `Certificaat '${cert}' is ongeldig.`}).end()
  })
}

/*
* Geeft alle nieuw chats van een stream in JSON terug
* @param {String} cert (uitgegeven door TheCircle)
* @param {String} timestamp (timestamp van het laatste bericht dat je ontvangen hebt)
* @param {Number} streamer (BSN van welke transparant persoon je aan het bekijken bent)
*/
function getChat (req, res) {
  const cert = req.headers.cert
  // Kijken of het certificaat geldig is, of het een user van TheCircle is.
  decryptCert(cert, readServerKey('public')).then((publicKey) => {
    // Chatberichten zoeken op basis van laatste timestamp vanuit de client
    let timestamp = req.headers.timestamp
    if (typeof timestamp === 'undefined') {
      timestamp = '0'
    }
    const streamer = parseInt(req.headers.streamer)
    Chat.aggregate([{$match: {streamer: streamer, timestamp: {$gt: timestamp}}}, {$lookup: {from: 'users', localField: 'bsn', foreignField: 'bsn', as: 'user'}}]).then((chats) => {
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
      console.log(`Geen nieuwe chats.`)
      res.status(200).json({error: `Geen nieuwe chats.`}).end()
    })
  }).catch((error) => {
    console.log(`Certificaat '${cert}' is ongeldig.`)
    res.status(400).json({error: `Certificaat '${cert}' is ongeldig.`}).end()
  })
}

function getChats (req, res) {
  const cert = req.headers.cert
  // Kijken of het certificaat geldig is, of het een user van TheCircle is.
  decryptCert(cert, readServerKey('public')).then((publicKey) => {
    // Chatberichten zoeken op basis van laatste timestamp vanuit de client
    let timestamp = req.headers.timestamp
    if (typeof timestamp === 'undefined') {
      timestamp = '0'
    }
    const streamer = parseInt(req.headers.streamer)
    Chat.aggregate([{$match: {streamer: streamer, timestamp: {$gt: timestamp}}}, {$lookup: {from: 'users', localField: 'bsn', foreignField: 'bsn', as: 'user'}}]).then((chats) => {
      let chatArray = []
      chats.forEach((chat) => {
        chatArray.push({
          message: chat.message,
          timestamp: chat.timestamp,
          name: chat.user[0].naam
        })
      })
      createSignature(JSON.stringify(chatArray), readServerKey('private')).then((signature) => {
        res.status(200).json({
          chats: chatArray,
          signature: signature
        }).end()
      }).catch((error) => {
        console.log(`Error making the signature for the chats.`)
        res.status(400).json({error: `Error making the signature for the chats.`}).end()
      })
    }).catch((error) => {
      console.log(`Geen nieuwe chats.`)
      res.status(200).json({error: `Geen nieuwe chats.`}).end()
    })
  }).catch((error) => {
    console.log(`Certificaat '${cert}' is ongeldig.`)
    res.status(400).json({error: `Certificaat '${cert}' is ongeldig.`}).end()
  })
}

// Export methods
module.exports = { postChat, getChat, getChats }
