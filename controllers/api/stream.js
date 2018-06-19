const { User, Stream } = require('../../models')
const { decryptCert, readServerKey } = require('../../utils/cryptographic')

function getStreams (req, res) {
  const cert = req.headers.cert
  verifyAuth(cert).then((result) => {
    res.status(200).json({error: 'Succes!'})
    // Stream.find().toArray(function(err, streams) {
    //     console.log(streams);
    // })
  }, () => {
    res.status(400).json({error: 'User not found'})
  })
}

function getStream (req, res) {

}

function postStream (req, res) {
  var key = req.body.key
  var stream = req.body.stream
  var auth = req.body.auth
}

function delStream (req, res) {

}

const verifyAuth = (encryted) => {
  return new Promise(function (resolve, reject) {
    if (!encryted) {
      reject(Error('User cert not correct'))
    }
    decryptCert(encryted, readServerKey('public')).then((publicKey) => {
      User.find({public: publicKey}).then((user, error) => {
        if (error) {
          reject(Error('Denied'))
        } else {
          resolve('Ok')
        }
      })
    }).catch(() => {
      reject(Error('User cert not correct'))
    })
  })
}

module.exports = { getStreams, getStream, postStream, delStream }
