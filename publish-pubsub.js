const util = require('util');
const retry = require('async/retry');

const JsIpfsServiceNode = require("geesome-libs/src/JsIpfsServiceNode");
const ipfsHelper = require("geesome-libs/src/ipfsHelper");

const IPFS = require('ipfs');

(async () => {
  const _waitForPeerToSubscribe = util.promisify(waitForPeerToSubscribe);

  const node = new IPFS({
    pass: 'pimento acaleph toxemia lilied insulter misdoubt cabbages spumones',
    EXPERIMENTAL: {
      pubsub: true,
      ipnsPubsub: true
    }
  });
  
  const _nodeId = util.promisify(node.id);

  try {
    await new Promise((resolve, reject) => {
      node.on('ready', (err) => err ? reject(err) : resolve());
      node.on('error', (err) => reject(err))
    });

    console.log('🎁 IPFS node have started');
  } catch (e) {
    console.error('❌ IPFS not started', e);
  }

  const ipfsService = new JsIpfsServiceNode(node);

  const selfIpns =  await ipfsService.getAccountIdByName('self');
  console.log('self ipns', selfIpns);

  const pubSubTestsName = 'pubsub-tests';
  await ipfsService.createAccountIfNotExists(pubSubTestsName);

  const pubSubTestsIpns = await ipfsService.getAccountIdByName(pubSubTestsName);
  console.log('pubsub-tests ipns', pubSubTestsIpns);

  const pubSubTestsPrivateKey = await ipfsService.keyLookup('pubsub-tests');
  console.log('pubSubTestsPrivateKey', pubSubTestsPrivateKey);
  const pubSubTestsPeerId = await ipfsHelper.createPeerIdFromPrivKey(pubSubTestsPrivateKey.bytes);
  console.log('pubSubTestsPeerId', pubSubTestsPeerId);

  ipfsService.subscribeToEvent('fruit', (data) => {
    console.log('on fruit', data)
  });

  const nodeId = await _nodeId();
  const listenData = await require('./listen-pubsub')(nodeId.addresses[0], selfIpns);
  
  console.log('waitForPeerToSubscribe', listenData.topic);
  
  const subscribedPeers = await _waitForPeerToSubscribe(node, listenData.topic);

  console.log('subscribedPeers', subscribedPeers);
  
  console.log('bindToStaticId');
  node.name.publish(`QmVHfpvraLsdz315esr92DE9ghVcssi95ukUaP4VpW1Kiu`, {
    key: pubSubTestsName,
    lifetime: '1h'
  });


  ipfsService.publishEventByPeerId(pubSubTestsPeerId, 'fruit', 'banana', () => {});
})();

//peerId.createFromPrivKey(Buffer.from(opts.privateKey, 'base64'), cb)

function waitForPeerToSubscribe (node, topic, callback) {
  retry({
    times: 5,
    interval: 2000
  }, (next) => {
    node.pubsub.peers(topic, (error, res) => {
      if (error) {
        return next(error)
      }

      if (!res || !res.length) {
        return next(new Error('Could not find subscription'))
      }

      return next(null, res)
    })
  }, callback)
}
//https://github.com/libp2p/js-libp2p-pubsub/commit/5cb17fd55986e99fd396ad2830aa673af259c8ab#diff-d4024471b15c32404831443a7a111f99R97

// const message = {
//   from: pubSubTestsIpns,
//   data: 'hello',
//   seqno: crypto.randomBytes(20),
//   topicIDs: ['test-topic']
// };
//
// const bytesToSign = Buffer.concat([SignPrefix, Message.encode(message)])
//
// peerId.privKey.sign(bytesToSign, (err, expectedSignature) => {
//   if (err) return done(err)
//
//   signMessage(peerId, message, (err, signedMessage) => {
//     if (err) return done(err)
//
//     // Check the signature and public key
//     expect(signedMessage.signature).to.eql(expectedSignature)
//     expect(signedMessage.key).to.eql(peerId.pubKey.bytes)
//
//     // Verify the signature
//     peerId.pubKey.verify(bytesToSign, signedMessage.signature, (err, verified) => {
//       expect(verified).to.eql(true)
//       done(err)
//     })
//   })
// })
