const { User, Stream } = require('../../models')
const { decryptCert, readServerKey } = require('../../utils/cryptographic')
const crypto = require('crypto')

//TODO: log all user requests
function getStreams (req, res) {
  const cert = req.headers.cert
  verifyAuth(cert).then((user) => {
      Stream.find({}).then((streams, error) => {
          if(error) {
              res.status(400).json({error: 'Something went wrong'})
          } else {
              res.status(200).json(streams)
          }
      })
  }, () => {
    res.status(400).json({error: 'User not found'})
  })
}

function getStream (req, res) {
    const cert = req.headers.cert
    const streamKey = req.params.streamId
    verifyAuth(cert).then((user) => {
        Stream.findOne({_id: streamKey}).then((stream, error) => {
            if(error) {
                res.status(400).json({error: "Could not find stream"})
            } else {
                res.status(200).json(stream)
}
        })
    }), () => {
    res.status(400).json({error: 'User not found'})
 }
}

function postStream (req, res) {
//   var key = req.body.key
//   var stream = req.body.stream
//   var auth = req.body.auth
  const cert = req.headers.cert  
  verifyAuth(cert).then((user) => {
    Stream.findOne({user: user._id}).then((stream, error) => {
        if (error) {
            res.status(400).json({error: 'You can only have one active stream'})
        } else {
            let hash = crypto.createHash('sha256').update(Date.now() + user.bsn + '').digest('hex');
            const newStream = new Stream({
            key: hash,
            user: user._id,
            url: ''
          })
          newStream.save((err) => {
            if (err) throw err
            console.log(`user saved!`)            
            res.status(200).json({message: 'Succes!'})
          }, () => {
            res.status(400).json({error: 'User not found'})            
        })
    }
  })
})
}

function delStream (req, res) {
    const cert = req.headers.cert
    const streamKey = req.params.streamId
    verifyAuth(cert).then((user) => {
        console.log(user);
        Stream.findOneAndRemove({_id: streamKey, user: user._id}).then((error) => {
            if(error) {
                res.status(400).json({error: "Could not find combination of user and stream"})
            } else {
                res.status(200).json({message: "Stream deleted"})
            }
        })
    }, () => {
    res.status(400).json({error: 'User not found'})
 })

}
const verifyAuth = (encryted) => {
  return new Promise(function (resolve, reject) {
    // if (!encryted) {
    //   reject(Error('User cert not correct'))
    // }
    decryptCert(encryted, readServerKey('public')).then((publicKey) => {
        console.log(publicKey)
      User.findOne({public: publicKey}).then((user, error) => {
        if (error || user === null) {
          reject(Error('Denied'))
        } else {
          resolve(user)
        }
      })
    }).catch(() => {
      reject(Error('User cert not correct'))
    })
  })
}

module.exports = { getStreams, getStream, postStream, delStream }
