var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})

// De data die de server ontvangt is niet encrypted.
/*
{ // Headers
  'hash': 'EclientPrivKey(hash(msg))',
  'cert': 'EserverPrivKey(eClientPubKey)'
}
{ // Body
  'msg': '123'
}
*/
