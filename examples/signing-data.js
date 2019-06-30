import * as ZionBase from '../src';

var keypair = ZionBase.Keypair.random();
var data = 'data to sign';
var signature = ZionBase.sign(data, keypair.rawSecretKey());

console.log('Signature: ' + signature.toString('hex'));

if (ZionBase.verify(data, signature, keypair.rawPublicKey())) {
  console.log('OK!');
} else {
  console.log('Bad signature!');
}
