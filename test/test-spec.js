const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()

describe('test chat api', () => {
  it('successful chatbericht', (done) => {
    chai.request(server).post('/api/chat').set('content-type', 'application/x-www-form-urlencoded').send({
      streamer: 0,
      message: 'test bericht!',
      signature: '',
      cert: ''
    }).end((err, res) => {
      done()
    })
  })
})

describe('test stream api', () => {

})

describe('test integrity api', () => {

})
