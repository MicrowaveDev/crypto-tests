const util = require('util');
const IPFS = require('ipfs');
const ipns = require('ipns');
const DaemonFactory = require('ipfsd-ctl');
const base64url = require('base64url');
const { fromB58String } = require('multihashes');

const namespace = '/record/';

module.exports = async (nodeId) => {
  const listenToNodeAddress = nodeId.addresses[0];
  const multihash = fromB58String(nodeId.id);
  const idKeys = ipns.getIdKeys(multihash);
  const topic = `${namespace}${base64url.encode(idKeys.routingKey.toBuffer())}`;
  
  console.log('listenToNodeAddress', listenToNodeAddress);
  console.log('multihash', multihash);
  
  const df = DaemonFactory.create({ type: 'proc' });
  const _dfSpawn = util.promisify(df.spawn).bind(df);

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

  await _pubSubSubscribe(topic, (data) => {
    console.log('event emitted!', data);
  });
  
  await _pubSubSubscribe('fruit', (data) => {
    console.log('fruit event emitted!', data);
  });

  console.log('subscribed to ' + topic);
  
  return {
    node,
    topic
  };
};
