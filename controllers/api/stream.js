const { User, Stream } = require('../../models')
const { decryptCert, readServerKey } = require('../../utils/cryptographic')

function getStreams (req, res) {
    const cert = req.headers.cert
    console.log(cert);
    verifyAuth(cert).then((res) => {
        res.status(200).json({error: "Succes!"})
        // Stream.find().toArray(function(err, streams) {
        //     console.log(streams);
        // })
    }, () => {
        res.status(400).json({error: "User not found"})
    })
    

}

function getStream (req, res) {

}

function postStream (req, res) {
    var key = req.body.key;
    var stream = req.body.stream;
    var auth = req.body.auth;



}

function delStream (req, res) {

}

const verifyAuth = (encryted) => {
    return new Promise(function(resolve, reject) {
        console.log(encryted);
      var serverKey = readServerKey('public');
      console.log(serverKey);
      decryptCert(encryted, serverKey).then((publicKey) => {
          console.log(publicKey);
        Stream.find({auth: publicKey}).then((user, error) => {
            if (error){
                reject("Denied")
            }
            else{
            console.log("Found the following user: " + user);
            authorized = true;
            resolve("Ok");
        }
        })    
      })      
    })
  }

module.exports = { getStreams, getStream, postStream, delStream }
