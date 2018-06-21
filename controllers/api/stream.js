const { User, Stream, Activity } = require('../../models')
const { decryptCert, readServerKey } = require('../../utils/cryptographic')
const crypto = require('crypto')

// TODO: log all user requests
function getStreams (req, res) {
  const cert = req.headers.cert
  verifyAuth(cert).then((user) => {
    Stream.find({})
      .populate({ path: 'user', select: '_id naam' })
      .then((streams, error) => {
        if (error) {
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
    Stream.findOne({_id: streamKey})
      .populate({ path: 'user', select: '_id naam' })
      .then((stream, error) => {
        if (error) {
          res.status(400).json({error: 'Could not find stream'})
        } else {
          const newActivity = new Activity({
            user: user._id,
            timestamp: Date.now() + '',
            activity: 'Get stream:' + '' + stream._id
          })
          newActivity.save((err) => {
            if (err) {
              res.status(400).json({error: 'Something went wrong'})
            } else {
              res.status(200).json(stream)
            }
          })
        }
      })
  }, () => {
    res.status(400).json({error: 'User not found'})
  })
}

function postStream (req, res) {
  const cert = req.headers.cert
  verifyAuth(cert).then((user) => {
    Stream.findOne({user: user._id}).then((stream, error) => {
      if (stream) {
        res.status(400).json({error: 'You can only have one active stream'})
      } else {
        let hash = crypto.createHash('sha256').update(Date.now() + user.bsn + '').digest('hex')
        const newStream = new Stream({
          key: hash,
          user: user._id,
          url: `http://37.97.244.58:8000/live/${hash}/index.m3u8`
        })
        newStream.save((err) => {
          if (err) {
            res.status(400).json({error: 'Something went wrong'})
          } else {
            const newActivity = new Activity({
              user: user._id,
              timestamp: Date.now() + '',
              activity: 'Post stream:' + '' + newStream._id
            })
            newActivity.save((err) => {
              if (err) {
                res.status(400).json({error: 'Something went wrong'})
              } else {
                res.status(200).json({stream: newStream, stream_url: `rtmp://37.97.244.58:1935/live/${hash}`})
              }
            })
          }
        })
      }
    })
  }, () => {
    res.status(400).json({error: 'User not found'})
  })
}

function delStream (req, res) {
  const cert = req.headers.cert
  const streamKey = req.params.streamId
  verifyAuth(cert).then((user) => {
    Stream.findOne({_id: streamKey, user: user._id})
      .then((stream, error) => {
        if (error || !stream) {
          res.status(400).json({error: 'Could not find combination of stream and user'})
        } else {
          stream.remove(res.status(200).json({message: 'Stream deleted'}));
        }
      })
  }, () => {
    res.status(400).json({error: 'User not found'})
  })
}

const verifyAuth = (encryted) => {
  return new Promise(function (resolve, reject) {
    if (!encryted) {
      reject(Error('User cert not correct'))
    }
    decryptCert(encryted, readServerKey('public')).then((publicKey) => {
      User.findOne({public: publicKey}).then((user, error) => {
        if (error) {
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
