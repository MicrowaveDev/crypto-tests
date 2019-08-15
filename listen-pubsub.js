const util = require('util');
const IPFS = require('ipfs');
const DaemonFactory = require('ipfsd-ctl');
const JsIpfsServiceNode = require("geesome-libs/src/JsIpfsServiceNode");
const ipfsHelper = require("geesome-libs/src/ipfsHelper");

module.exports = async (listenToNodeAddress, ipnsToSubscribe) => {
  console.log('listenToNodeAddress', listenToNodeAddress);
  console.log('ipnsToSubscribe', ipnsToSubscribe);
  
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

  const ipfsService = new JsIpfsServiceNode(node.api);
  
  await ipfsService.swarmConnect(listenToNodeAddress);
  
  await ipfsService.subscribeToIpnsUpdates(ipnsToSubscribe, async (event) => {
    console.log('event emitted!', event);
  });
  
  await ipfsService.pubSubSubscribe('fruit', (event) => {
    event.data = event.data.toString('utf8');
    console.log('fruit event emitted!', event);
  });
  
  const topic = ipfsHelper.getIpnsUpdatesTopic(ipnsToSubscribe);

  console.log('subscribed to ' + topic);
  
  return {
    node,
    topic
  };
};
