const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()
const NodeRSA = require('node-rsa')

chai.use(chaiHttp)

const userCert = process.env.testUserCert
const userPrivate = process.env.testUserPrivateKey

describe('test chat api', () => {
  it('successful chatbericht', (done) => {
    chai.request(server).post('/api/chat').set('content-type', 'application/x-www-form-urlencoded').send({
      streamer: 0,
      message: 'test bericht!',
      signature: '',
      cert: userCert
    }).end((err, res) => {
      done()
    })
  })
})

describe('test stream api', () => {
  it('Succesvol ophalen van alle steams', (done) => {
    chai.request(server).get('/api/streams').set('cert', userCert).end((err,res) => {
      if (err) throw err
      res.should.have.status(200)
      res.body.should.be.a('array')
      done()
    })
  })
  it('Succesvol aanmaken van een stream', (done) => {
    chai.request(server).post('/api/streams').set('cert', userCert).end((err, res) => {
      if (err) throw err
      res.should.have.status(200)
    })
  })

})

describe('test integrity api', () => {

})
