const util = require('util');
const IPFS = require('ipfs');
const DaemonFactory = require('ipfsd-ctl');
const { GeesomeClient } = require('geesome-libs/src/GeesomeClient');
const JsIpfsServiceNode = require("geesome-libs/src/JsIpfsServiceNode");

(async () => {
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

  // const ipfsService = new JsIpfsServiceNode(node.api);
  //
  // // console.log('swarmConnect', listenToNodeAddress);
  // await ipfsService.swarmConnect('/ip4/127.0.0.1/tcp/4002/ipfs/QmaWLEh7nyVhM6QhsQ51JzgCDyFS2VAMbp5v5MNzuFEt33');
  //
  // await ipfsService.pubSubSubscribe('geesome-test', (event) => {
  //   event.data = event.data.toString('utf8');
  //   console.log('geesome-test event emitted!', event);
  // });
  //
  const geesomeClient = new GeesomeClient({
    server: 'http://localhost:7711',
    // paste apiKey from GeeSome UI here
    apiKey: '4J1VYKW-ZP34Y0W-PREH1Q2-DYN9Q8E',
    ipfsNode: node.api
  });
  await geesomeClient.init();

  await geesomeClient.subscribeToPersonalChatUpdates(["Qmf26MKUNKtB7aw29afKYMhvYVL4zm2FHLs4AG6e5968pQ", "Qme5v5iSDCw3ECwxBayCSdmZGRDJNb5HVJNiTECUt4h9co"], 'default', (event) => {
    console.log('personalChatUpdates', event);
  });

  await geesomeClient.ipfsService.pubSubSubscribe('geesome-test', (data) => {
    console.log('geesome-test', data);
  })
})();
