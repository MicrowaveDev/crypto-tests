const bip39 = require('bip39');
const bech32 = require('bech32');
const bip32 = require('bip32');
const secp256k1 = require('secp256k1');
const bitcoinjs = require('bitcoinjs-lib');
const HEX = require('crypto-js/enc-hex');

const RIPEMD160 = require('crypto-js/ripemd160');
const SHA256 = require('crypto-js/sha256');
// import * as terra from '@terra-money/core/src';

const networkIndex = 330;
const accountIndex = 0;

(async () => {
  const mnemonic = bip39.generateMnemonic();
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const node = bip32.fromSeed(seed);
  const child = node.derivePath(`m/44'/${networkIndex}'/0'/0/${accountIndex}`);
  const words = bech32.toWords(child.identifier);
  const address = bech32.encode('terra', words);
  const ecpair = bitcoinjs.ECPair.fromPrivateKey(child.privateKey, { compressed: false });
  const privateKey = ecpair.privateKey.toString('hex');

  // const terraMnemonic = generateMnemonic();
  const masterKey = await deriveMasterKey(mnemonic);
  const keypair = deriveKeypair(masterKey, 0, 0);
  const accAddr = getAccAddress(keypair.publicKey);
  
  console.log('terra accAddr', accAddr, keypair.privateKey.toString('hex'));
  
  console.log('networkIndex', networkIndex);
  console.log('accountIndex', accountIndex);
  console.log('mnemonic', mnemonic);
  console.log('address', address);
  console.log('privateKey', privateKey);
})();


const accPrefix = `terra`
const valPrefix = `terravaloper`

async function deriveMasterKey(mnemonic: string) {
  // throws if mnemonic is invalid
  bip39.validateMnemonic(mnemonic)

  const seed = await bip39.mnemonicToSeed(mnemonic)
  return bip32.fromSeed(seed)
}

interface KeyPair {
  privateKey: Buffer
  publicKey: Buffer
}

function deriveKeypair(masterKey: any, account: any, index: any) {
  const hdPathLuna = `m/44'/330'/${account}'/0/${index}`
  const terraHD = masterKey.derivePath(hdPathLuna)
  const privateKey = terraHD.privateKey
  const publicKey = secp256k1.publicKeyCreate(privateKey, true)

  if (!privateKey) {
    throw 'Failed to derive key pair'
  }

  return {
    privateKey,
    publicKey
  }
}

// NOTE: this only works with a compressed public key (33 bytes)
function getAddress(publicKey: Buffer): Buffer {
  const message = HEX.parse(publicKey.toString(`hex`))
  const hash = RIPEMD160(SHA256(message)).toString()
  const address = Buffer.from(hash, `hex`)
  return bech32.toWords(address)
}

// NOTE: this only works with a compressed public key (33 bytes)
function getAccAddress(publicKey: Buffer): string {
  const words = getAddress(publicKey)
  return bech32.encode(accPrefix, words)
}

function generateMnemonic(): string {
  return bip39.generateMnemonic(256)
}
