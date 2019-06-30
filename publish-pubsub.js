const util = require('util');
const assert = require('assert');
const _ = require('lodash');
const noop = () => {
};

const FloodSub = require('libp2p-floodsub');
const {signMessage} = require('libp2p-pubsub/src/message/sign');
const peerId = require('peer-id');
const crypto = require('libp2p-crypto');
const errcode = require('err-code');
const asyncMap = require('async/map');
const waterfall = require('async/waterfall');
const nextTick = require('async/nextTick');
const retry = require('async/retry');
const {message, utils} = require('libp2p-pubsub');
const ensureArray = utils.ensureArray

const JsIpfsServiceNode = require("@galtproject/geesome-libs/src/JsIpfsServiceNode");

const IPFS = require('ipfs');

(async () => {
  const _keyLookup = util.promisify(keyLookup);
  const _createPeerIdFromPrivKey = util.promisify(peerId.createFromPrivKey);
  const _waitForPeerToSubscribe = util.promisify(waitForPeerToSubscribe);

  const node = new IPFS({
    pass: 'pimento acaleph toxemia lilied insulter misdoubt cabbages spumones',
    EXPERIMENTAL: {
      pubsub: true,
      ipnsPubsub: true
    }
  });
  
  const _nodeId = util.promisify(node.id);

  // console.log('node', node);
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
  //
  const selfIpns =  await ipfsService.getAccountIdByName('self');
  console.log('self ipns', selfIpns);
  //
  const pubSubTestsName = 'pubsub-tests';
  await ipfsService.createAccountIfNotExists(pubSubTestsName);

  const pubSubTestsIpns = await ipfsService.getAccountIdByName(pubSubTestsName);
  console.log('pubsub-tests ipns', pubSubTestsIpns);

  // console.log('node', node);
  // console.log('node._repo.keys', node._repo.keys);

  const pubSubTestsPrivateKey = await _keyLookup(node, 'pubsub-tests');
  console.log('pubSubTestsPrivateKey', pubSubTestsPrivateKey);
  const pubSubTestsPeerId = await _createPeerIdFromPrivKey(pubSubTestsPrivateKey.bytes);
  console.log('pubSubTestsPeerId', pubSubTestsPeerId);

  // console.log('node', node);
  // console.log('node._floodSub', node._floodSub);

  // const fsub = new FloodSub(node.libp2p);
  // fsub.peerId = pubSubTestsPeerId;
  const fsub = node.libp2p._floodSub;
  // //
  improveFloodSub(fsub);
  improvePubSub(fsub);

  // console.log('node.libp2p.peerInfo.id', node.libp2p.peerInfo.id);
  //
  fsub.on('fruit', (data) => {
    console.log('on fruit', data)
  });
  fsub.subscribe('fruit');

  fsub.publishByPeerId(pubSubTestsPeerId, 'fruit', new Buffer('banana'), () => {});

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

  node.pubsub.publish('fruit', new Buffer('banana2'), (err) => {
    console.log('err', err);
  });
})();

//peerId.createFromPrivKey(Buffer.from(opts.privateKey, 'base64'), cb)

function improveFloodSub(fsub) {
  //https://github.com/libp2p/js-libp2p-floodsub/blob/4feadeb9ef0cc35892a9c499c740e759b3d73ec8/src/index.js#L167
  fsub.publishByPeerId = (function (peerId, topics, messages, callback) {
    assert(this.started, 'FloodSub is not started')
    callback = callback || noop

    this.log('publish', topics, messages)

    topics = ensureArray(topics)
    messages = ensureArray(messages)

    const from = this.libp2p.peerInfo.id.toB58String();

    const buildMessage = (msg, cb) => {
      const seqno = utils.randomSeqno()
      this.seenCache.put(utils.msgId(from, seqno))

      const message = {
        from: from,
        data: msg,
        seqno: seqno,
        topicIDs: topics
      }

      // Emit to self if I'm interested
      this._emitMessages(topics, [message])

      this._buildMessageByPeerId(peerId, message, cb)
    }

    asyncMap(messages, buildMessage, (err, msgObjects) => {
      if (err) return callback(err)

      // send to all the other peers
      this._forwardMessages(topics, msgObjects)

      callback(null)
    })
  }).bind(fsub);

  fsub.publish = function (topics, messages, callback) {
    this.publishByPeerId(this.peerId, topics, messages, callback);
  };
}


function improvePubSub(fsub) {
  // https://github.com/libp2p/js-libp2p-pubsub/blob/f1e188929d779e7af91e1fd039b2c3b95cdf05df/src/index.js#L246
  fsub._buildMessageByPeerId = (function (peerId, message, callback) {
    const msg = utils.normalizeOutRpcMessage(message)
    if (peerId) {
      signMessage(peerId, msg, callback)
    } else {
      nextTick(callback, null, msg)
    }
  }).bind(fsub);
  
  fsub._buildMessage = (function (message, callback) {
    this._buildMessageByPeerId(this.peerId, message, callback)
  }).bind(fsub);
}


function keyLookup(ipfsNode, kname, callback) {
  if (kname === 'self') {
    return callback(null, ipfsNode._peerInfo.id.privKey)
  }
  const pass = ipfsNode._options.pass

  waterfall([
    (cb) => ipfsNode._keychain.exportKey(kname, pass, cb),
    (pem, cb) => crypto.keys.import(pem, pass, cb)
  ], (err, privateKey) => {
    if (err) {
      log.error(err)
      return callback(errcode(err, 'ERR_CANNOT_GET_KEY'))
    }

    return callback(null, privateKey)
  })
}

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
