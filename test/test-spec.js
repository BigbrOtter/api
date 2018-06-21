const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()
const NodeRSA = require('node-rsa')
const crypto = require('crypto')
const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId
const { User } = require('../models')
const DBUSER = process.env.DBUSER
const DBPASS = process.env.DBPASS
const DBHOST = process.env.DBHOST
const DBPORT = process.env.DBPORT
const DBNAME = process.env.DBNAME

chai.use(chaiHttp)

const userCert = process.env.testUserCert
const userPrivate = process.env.testUserPrivateKey

describe('test chat api', () => {
  let chat
  it('successful chatbericht', (done) => {
    const testUserPrivateKey = new NodeRSA(process.env.testUserPrivateKey, 'pkcs1')
    const message = crypto.randomBytes(20).toString('hex')
    const body = {
      streamer: 0,
      message: message,
      signature: testUserPrivateKey.encryptPrivate(crypto.createHash('sha256').update(message).digest('hex'), 'base64'),
      cert: userCert
    }
    chai.request(server).post('/api/chat').set('content-type', 'application/x-www-form-urlencoded').send(body).end((err, res) => {
      res.should.have.status(200)
      res.body.status.should.equal('OK')
      chat = res.body.chat
      done()
    })
  })
  it('successful chats ophalen', (done) => {
    chai.request(server).get('/api/chat').set('cert', userCert).set('timestamp', chat.timestamp - 1).set('streamer', chat.bsn).end((err, res) => {
      res.should.have.status(200)
      console.log(res.body)
      console.log(res.body.chats)
      done()
    })
  })
})
