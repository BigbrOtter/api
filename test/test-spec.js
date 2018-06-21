const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()
const NodeRSA = require('node-rsa')

chai.use(chaiHttp)

const wrongUserCert = process.env.testWrongUserCert
const userCert = process.env.testUserCert
const userPrivate = process.env.testUserPrivateKey

// describe('test chat api', () => {
//   it('successful chatbericht', (done) => {
//     chai.request(server).post('/api/chat').set('content-type', 'application/x-www-form-urlencoded').send({
//       streamer: 0,
//       message: 'test bericht!',
//       signature: '',
//       cert: userCert
//     }).end((err, res) => {
//       done()
//     })
//   })
// })

describe('test stream api', () => {
  var streamId;
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
      res.body.should.be.a("object")
      streamId = res.body.stream._id
      done()
    })
  })
  it('Succesvol ophalen van een stream', (done) => {
    chai.request(server).get(`/api/streams/${streamId}`).set('cert', userCert).end((err, res) => {
      if (err) throw err
      res.should.have.status(200)
      res.body.should.be.a("object")
      done()
    })
  })
  it('Succesvol verwijderen van een stream', (done) => {
    chai.request(server).delete(`/api/streams/${streamId}`).set('cert', userCert).end((err, res) => {
      if (err) throw err
      res.should.have.status(200)
      res.body.should.be.a("object")
      res.body.message.should.equals('Stream deleted')      
      done()
    })
  })
  it('Ophalen van stream zonder certificaat', (done) => {
    chai.request(server).get(`/api/streams`).end((err, res) => {
      if (err) throw err
      res.should.have.status(400)
      res.body.should.be.a("object")
      res.body.error.should.equals('User not found')      
      done()
    })
  })
  it('Stream verwijderen met verkeerde certificaat', (done) => {
    chai.request(server).delete(`/api/streams/${streamId}`).set('cert', wrongUserCert).end((err, res) => {
      if (err) throw err
      res.should.have.status(400)
      res.body.should.be.a("object") 
      res.body.error.should.equals('Could not find combination of stream and user')    
      done()
    })
  })

})

describe('test integrity api', () => {

})
