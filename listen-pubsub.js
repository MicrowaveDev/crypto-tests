const util = require('util');
const IPFS = require('ipfs');
const ipns = require('ipns');
const DaemonFactory = require('ipfsd-ctl');
const base64url = require('base64url');
const { fromB58String } = require('multihashes');
const peerId = require('peer-id');

const namespace = '/record/';

const _createPeerIdFromPubKey = util.promisify(peerId.createFromPubKey);

module.exports = async (listenToNodeAddress, ipnsToSubscribe) => {
  console.log('listenToNodeAddress', listenToNodeAddress);
  console.log('ipnsToSubscribe', ipnsToSubscribe);
  
  const multihash = fromB58String(ipnsToSubscribe);
  const idKeys = ipns.getIdKeys(multihash);
  const topic = `${namespace}${base64url.encode(idKeys.routingKey.toBuffer())}`;
  
  const df = DaemonFactory.create({ type: 'proc' });
  const _dfSpawn = util.promisify(df.spawn).bind(df);

  //https://github.com/ipfs/js-ipfs/blob/f596b01fc1dab211c898244151017867d182909d/test/core/name-pubsub.js
  const node = await _dfSpawn({
    exec: IPFS,
    args: [`--pass toxemia spumones lilied pimento acaleph spumones insulter misdoubt cabbages`, '--enable-namesys-pubsub'],
    config: {
      Bootstrap: [],
      Discovery: {
        MDNS: {
          Enabled: false
        },
        webRTCStar: {
          Enabled: false
        }
      }
    },
    preload: { enabled: false }
  });

  const _swarmConnect = util.promisify(node.api.swarm.connect).bind(node.api.swarm);
  await _swarmConnect(listenToNodeAddress);
  
  const _pubSubSubscribe = util.promisify(node.api.pubsub.subscribe).bind(node.api.pubsub);

  await _pubSubSubscribe(topic, async (event) => {
    event.key = await _createPeerIdFromPubKey(event.key);
    event.data = ipns.unmarshal(event.data);
    event.data.peerId = await _createPeerIdFromPubKey(event.data.pubKey);

    event.data.value = event.data.value.toString('utf8');
    console.log('event emitted!', event);
  });
  
  await _pubSubSubscribe('fruit', (event) => {
    event.data = event.data.toString('utf8');
    console.log('fruit event emitted!', event);
  });

  console.log('subscribed to ' + topic);
  
  return {
    node,
    topic
  };
};
