const util = require('util');
const IPFS = require('ipfs');
const DaemonFactory = require('ipfsd-ctl');
const { GeesomeClient } = require('geesome-libs/src/GeesomeClient');
const ipfsHelper = require('geesome-libs/src/ipfsHelper');
const JsIpfsServiceNode = require("geesome-libs/src/JsIpfsServiceNode");
const openpgp = require('openpgp');
const forge = require('node-forge/lib/forge');

const BN = require('bn.js');
const _ = require('lodash');

// import SecretKey from 'openpgp/src/packet/secret_key.js';
// const openpgpArmor = require('openpgp/src/encoding/armor');
// const openpgpEnums = require('openpgp/src/enums');

// console.log('openpgp', openpgp.armor);
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
  
  const geesomeClient = new GeesomeClient({
    server: 'http://localhost:7711',
    // paste apiKey from GeeSome UI here
    apiKey: '4J1VYKW-ZP34Y0W-PREH1Q2-DYN9Q8E',
    ipfsNode: node.api
  });
  await geesomeClient.init();
  
  const bobId = await geesomeClient.ipfsService.createAccountIfNotExists('bob');
  const aliceId = await geesomeClient.ipfsService.createAccountIfNotExists('alice');

  const bobKey = await geesomeClient.ipfsService.keyLookup(bobId);
  const aliceKey = await geesomeClient.ipfsService.keyLookup(aliceId);
  
  /**
   * Private key object as result
   */
  // const buffer = new forge.util.ByteBuffer(bobKey.marshal());
  // console.log('buffer', bobKey.marshal());
  // const asn1 = forge.asn1.fromDer(buffer);
  // const privateKey = forge.pki.privateKeyFromAsn1(asn1);
  // ['p', 'q', 'n', 'e', 'd'].forEach(field => {
  //   privateKey[field] = new BN(privateKey[field].toString(10));
  // });
  // privateKey.u = privateKey.p.invm(privateKey.q);

  /**
   * Does not conform to a valid OpenPGP format.
   */
  // const bobPrivateKey = (await openpgp.key.read(bobKey.marshal()));
  // console.log('bobPrivateKey', bobPrivateKey);

  /**
   * Does not conform to a valid OpenPGP format.
   */
  // const bobPrivateKey = (await openpgp.key.read(bobKey.bytes));
  // console.log('bobPrivateKey', bobPrivateKey);

  /**
   * Unknown ASCII armor type
   */
  // const tempPassword = 'temp';
  // bobKey.export(tempPassword, async (err, pem) => {
  //   console.log('pem', pem);
  //
  //   const bobPrivateKey = (await openpgp.key.readArmored(pem));
  //   // bobPrivateKey.decrypt(tempPassword);
  //   console.log('bob', bobPrivateKey)//, bobPublicKey);
  // });

  /**
   * Does not conform to a valid OpenPGP format.
   */
  // const tempPassword = 'temp';
  // bobKey.export(tempPassword, async (err, pem) => {
  //   pem = pem.replace('-----BEGIN ENCRYPTED PRIVATE KEY-----', 
  //     '-----BEGIN PGP PRIVATE KEY BLOCK-----\n' +
  //     'Version: GnuPG v2.0.19 (GNU/Linux)\n'
  //   );
  //   pem = pem.replace('-----END ENCRYPTED PRIVATE KEY-----',
  //     '-----END PGP PRIVATE KEY BLOCK-----'
  //   );
  //   console.log('pem', pem);
  //
  //   const bobPrivateKey = (await openpgp.key.readArmored(pem));
  //   // bobPrivateKey.decrypt(tempPassword);
  //   console.log('bob', bobPrivateKey)//, bobPublicKey);
  // });

  /**
   * DONT NO WHAT TO DO WITH ▒├ ±␊├T≤⎻␊ (/U⎽␊
   */
  // console.log('bobKey._key', bobKey._key);
  // bobKey._key.dP = bobKey._key.dp;
  // bobKey._key.dQ = bobKey._key.dq;
  // bobKey._key.qInv = bobKey._key.qi;
  // const bytes = forge.asn1.toDer(forge.pki.privateKeyToAsn1(bobKey._key)).getBytes();
  
  // const secretKey = new openpgp.packet.SecretKey();
  // console.log('secretKey', secretKey);

  // console.log('bobKey._key', [bobKey._key.n, bobKey._key.e, bobKey._key.d, bobKey._key.p, bobKey._key.q, bobKey._key.u]);
  // const algo = openpgp.enums.write(openpgp.enums.publicKey, openpgp.enums.publicKey.rsa_encrypt_sign);
  // const types = [].concat(openpgp.crypto.getPubKeyParamTypes(algo), openpgp.crypto.getPrivKeyParamTypes(algo));
  // const params = openpgp.crypto.constructParams(
  //   types, [privateKey.n, privateKey.e, privateKey.d, privateKey.p, privateKey.q, privateKey.u]
  // );
  // console.log('params');
  // const key = new openpgp.packet.List();
  // const secretKey = new openpgp.packet.SecretKey();
  // secretKey.params = params;
  // secretKey.algorithm = openpgp.enums.publicKey.rsa_encrypt_sign;
  // key.push(secretKey);
  //
  // console.log('key.write()', key.write());

  //openpgp.armor.encode(openpgp.enums.armor.private_key, bobKey.bytes);
  

  // const bobPrivatePem = openpgp.armor.encode(openpgp.enums.armor.private_key, buffer);
  // const alicePrivatePem = openpgp.armor.encode(openpgp.enums.armor.private_key, aliceKey.bytes);
  //
  // const bobPublicPem = openpgp.armor.encode(openpgp.enums.armor.public_key, bobKey.public.bytes);
  // const alicePublicPem = openpgp.armor.encode(openpgp.enums.armor.public_key, aliceKey.public.bytes);

  // console.log('bob pem');
  // console.log(bobPrivatePem);
  // console.log(bobPublicPem);
  
  const bobPrivateKey = await getKey(bobKey);
  const alicePrivateKey = await getKey(aliceKey);
  
  const bobPublicKey = await getKey(bobKey);
  const alicePublicKey = await getKey(aliceKey);

  // console.log('alice', aliceId, aliceKey.bytes, alicePrivateKey);
  //
  const encryptOptions = {
    message: openpgp.message.fromText('Hello, World!'),       // input as Message object
    publicKeys: [alicePublicKey], // for encryption
    privateKeys: [bobPrivateKey]                                 // for signing (optional)
  };
  console.log('encryptOptions', encryptOptions);
  const { data: encryptedData } = await openpgp.encrypt(encryptOptions);

  console.log('encryptedData', encryptedData);

  const decryptOptions = {
    message: await openpgp.message.readArmored(encryptedData),    // parse armored message
    publicKeys: [bobPublicKey], // for verification (optional)
    privateKeys: [alicePrivateKey]                                 // for decryption
  };

  const { data: decryptedData } = await openpgp.decrypt(decryptOptions);

  console.log('decryptedData', decryptedData);
})();

async function getKey(ipfsKey) {
  const buffer = new forge.util.ByteBuffer(ipfsKey.marshal());
  // console.log('buffer', ipfsKey.marshal());
  const asn1 = forge.asn1.fromDer(buffer);
  const privateKey = forge.pki.privateKeyFromAsn1(asn1);
  ['p', 'q', 'n', 'e', 'd'].forEach(field => {
    privateKey[field] = new BN(privateKey[field].toString(10));
  });
  privateKey.u = privateKey.p.invm(privateKey.q);

  const algo = openpgp.enums.write(openpgp.enums.publicKey, openpgp.enums.publicKey.rsa_encrypt_sign);
  const types = [].concat(openpgp.crypto.getPubKeyParamTypes(algo), openpgp.crypto.getPrivKeyParamTypes(algo));
  const params = openpgp.crypto.constructParams(
    types, [privateKey.n, privateKey.e, privateKey.d, privateKey.p, privateKey.q, privateKey.u]
  );
  console.log('params');
  const packetList = new openpgp.packet.List();
  const secretKey = new openpgp.packet.SecretKey();
  secretKey.params = params;
  secretKey.algorithm = openpgp.enums.publicKey.rsa_encrypt_sign;
  packetList.push(secretKey);

  const userIdPacket = new openpgp.packet.Userid();
  userIdPacket.format({ name:'Phil Zimmermann', email:'phil@openpgp.org' });

  packetList.push(userIdPacket);

  const signaturePacket = new openpgp.packet.Signature(new Date());
  signaturePacket.signatureType = openpgp.enums.signature.cert_generic;
  signaturePacket.publicKeyAlgorithm = secretKey.algorithm;
  signaturePacket.hashAlgorithm = await openpgp.key.getPreferredHashAlgo(null, secretKey);
  signaturePacket.keyFlags = [openpgp.enums.keyFlags.certify_keys | openpgp.enums.keyFlags.sign_data];
  
  const config = {};
  
  signaturePacket.preferredSymmetricAlgorithms = createdPreferredAlgos([
    // prefer aes256, aes128, then aes192 (no WebCrypto support: https://www.chromium.org/blink/webcrypto#TOC-AES-support)
    openpgp.enums.symmetric.aes256,
    openpgp.enums.symmetric.aes128,
    openpgp.enums.symmetric.aes192,
    openpgp.enums.symmetric.cast5,
    openpgp.enums.symmetric.tripledes
  ], config.encryption_cipher);
  if (config.aead_protect) {
    signaturePacket.preferredAeadAlgorithms = createdPreferredAlgos([
      openpgp.enums.aead.eax,
      openpgp.enums.aead.ocb
    ], config.aead_mode);
  }
  signaturePacket.preferredHashAlgorithms = createdPreferredAlgos([
    // prefer fast asm.js implementations (SHA-256). SHA-1 will not be secure much longer...move to bottom of list
    openpgp.enums.hash.sha256,
    openpgp.enums.hash.sha512,
    openpgp.enums.hash.sha1
  ], config.prefer_hash_algorithm);
  signaturePacket.preferredCompressionAlgorithms = createdPreferredAlgos([
    openpgp.enums.compression.zlib,
    openpgp.enums.compression.zip
  ], config.compression);
  signaturePacket.isPrimaryUserID = true;
  if (config.integrity_protect) {
    signaturePacket.features = [0];
    signaturePacket.features[0] |= openpgp.enums.features.modification_detection;
  }
  if (config.aead_protect) {
    signaturePacket.features || (signaturePacket.features = [0]);
    signaturePacket.features[0] |= openpgp.enums.features.aead;
  }
  if (config.v5_keys) {
    signaturePacket.features || (signaturePacket.features = [0]);
    signaturePacket.features[0] |= openpgp.enums.features.v5_keys;
  }

  packetList.push(signaturePacket);

  const dataToSign = {};
  dataToSign.userId = userIdPacket;
  dataToSign.key = secretKey;
  
  secretKey.isDecrypted = (function () {
    return true;
  }).bind(secretKey);
  
  await signaturePacket.sign(secretKey, dataToSign);
  
  const resultKey = new openpgp.key.Key(packetList);

  resultKey.getSigningKey = (function () {
    return this;
  }).bind(resultKey);

  resultKey.getEncryptionKey = (function () {
    return this;
  }).bind(resultKey);
  
  resultKey.getPrimaryUser = (async function () {
    const primaryKey = this.keyPacket;
    const dataToVerify = { userId: userIdPacket, key: primaryKey };
    const selfCertification = await getLatestValidSignature(this.users[0].selfCertifications, primaryKey, openpgp.enums.signature.cert_generic, dataToVerify);
    return _.extend(this.users[0], { selfCertification });
  }).bind(resultKey);
  
  return resultKey;
}

function createdPreferredAlgos(algos, configAlgo) {
  if (configAlgo) { // Not `uncompressed` / `plaintext`
    const configIndex = algos.indexOf(configAlgo);
    if (configIndex >= 1) { // If it is included and not in first place,
      algos.splice(configIndex, 1); // remove it.
    }
    if (configIndex !== 0) { // If it was included and not in first place, or wasn't included,
      algos.unshift(configAlgo); // add it to the front.
    }
  }
  return algos;
}

async function getLatestValidSignature(signatures, primaryKey, signatureType, dataToVerify, date = new Date()) {
  let signature;
  for (let i = signatures.length - 1; i >= 0; i--) {
    if ((!signature || signatures[i].created >= signature.created) &&
      // check binding signature is not expired (ie, check for V4 expiration time)
      !signatures[i].isExpired(date) && (
        // check binding signature is verified
        signatures[i].verified || (await signatures[i].verify(primaryKey, signatureType, dataToVerify)))) {
      signature = signatures[i];
    }
  }
  return signature;
}
