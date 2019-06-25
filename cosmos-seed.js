const bip39 = require('bip39');
const bech32 = require('bech32');
const bip32 = require('bip32');
const bitcoinjs = require('bitcoinjs-lib');

const networkIndex = 118;
const accountIndex = 0;

(async () => {
  const mnemonic = bip39.generateMnemonic();
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(`m/44'/${networkIndex}'/0'/0/${accountIndex}`);
  const words = bech32.toWords(child.identifier);
  const address = bech32.encode('cyber', words);
  const ecpair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey, { compressed: false });
  const privateKey = ecpair.privateKey.toString('hex');
  
  console.log('networkIndex', networkIndex);
  console.log('accountIndex', accountIndex);
  console.log('mnemonic', mnemonic);
  console.log('address', address);
  console.log('privateKey', privateKey);
})();
