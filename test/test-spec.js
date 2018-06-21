const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const should = chai.should()

chai.use(chaiHttp)

const cert = "KKsOCYy0uQgcKIPU8OgI8PtAXQEecQzqVBL6QTcnY0RzHRSc+0BXdyEpCROeTpjY3F6hWcEcZoVY5P7mehH33+310457oFqZRy8j350eWDfp9lKuShVGR0Doq212q6mOtMxxkv8JM2+WjDmsKdxmvUJJnJJ8Z7AQmAd3z+2ch1ZijajM/ai1itOegvmuA8XE6iu9AAXdvUNkaGC9b06kU3OtxWHbnqHFQ4ei66zP8hwiyhjsyZVRGSeDSuTjfqFkdKmMgvDuBEiQsYrdhm3myqKpUVlarM/Cr33vpwwoP9XZY8xEFxx9jzIqBVHEb3b5ca1owIrl/4ZDZUw58cTk9oCRY09TMt3TUx0Ed7o64NlQ9j85/FwuzIRYZOsuwnyho2+AG14lWM7iPCvbOlVcvV+A98fqHxXxLc4UnUFi5O7CalbEp6e7InhVsugprO4ZlvNLhtiVSzlXhk29ysBFoQWMxNtNvRbp8Hw6sLxKAYpdqTZmUd33/KLPeEJFNvM4ENT5desuP7KVAm6LZozOwMPXf4IkL9jvsbXCCFvNYwgvqfDGrvGit3whgg3krJTmJVKCtrsQ0Y3aevUbhDsRcBViFr+5dHDzMLTzkJ2oMcDz0ncA74nL7G/wIa385Fi8QYoMEnITt/GGqtmOGkNYDtYtN0G1Pf4LaSOeXBHJ8pg="

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
  it('Succesvol ophalen van alle steams', (done) => {
    chai.request(server).get('/api/streams').set('cert', cert).end((err,res) => {
      if (err) throw err
      res.should.have.status(200)
      res.body.should.be.a('array')
    })
  })

})

describe('test integrity api', () => {

})
