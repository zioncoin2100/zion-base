import * as RainbowSdk from 'zion-base';

const sourceKey = RainbowSdk.Keypair.random(); // $ExpectType Keypair
const destKey = RainbowSdk.Keypair.random();
const account = new RainbowSdk.Account(sourceKey.publicKey(), '1');
const transaction = new RainbowSdk.TransactionBuilder(account)
  .addOperation(
    RainbowSdk.Operation.accountMerge({ destination: destKey.publicKey() })
  )
  .addMemo(new RainbowSdk.Memo(RainbowSdk.MemoText, 'memo'))
  .setTimeout(5)
  .build(); // $ExpectType () => Transaction<Memo<MemoType>, Operation[]>

const sig = RainbowSdk.xdr.DecoratedSignature.fromXDR(Buffer.of(1, 2)); // $ExpectType DecoratedSignature
sig.hint(); // $ExpectType Buffer
sig.signature(); // $ExpectType Buffer

RainbowSdk.Memo.none(); // $ExpectType Memo<"none">
RainbowSdk.Memo.text('asdf'); // $ExpectType Memo<"text">
RainbowSdk.Memo.id('asdf'); // $ExpectType Memo<"id">
RainbowSdk.Memo.return('asdf'); // $ExpectType Memo<"return">
RainbowSdk.Memo.hash('asdf'); // $ExpectType Memo<"hash">
RainbowSdk.Memo.none().value; // $ExpectType null
RainbowSdk.Memo.id('asdf').value; // $ExpectType string
RainbowSdk.Memo.text('asdf').value; // $ExpectType string | Buffer
RainbowSdk.Memo.return('asdf').value; // $ExpectType Buffer
RainbowSdk.Memo.hash('asdf').value; // $ExpectType Buffer

// P.S. don't use Memo constructor
new RainbowSdk.Memo(RainbowSdk.MemoHash, 'asdf').value; // $ExpectType MemoValue
// (new RainbowSdk.Memo(RainbowSdk.MemoHash, 'asdf')).type; // $ExpectType MemoType  // TODO: Inspect what's wrong with linter.

const noSignerXDR = RainbowSdk.Operation.setOptions({ lowThreshold: 1 });
RainbowSdk.Operation.fromXDRObject(noSignerXDR).signer; // $ExpectType never

const newSignerXDR1 = RainbowSdk.Operation.setOptions({
  signer: { ed25519PublicKey: sourceKey.publicKey(), weight: '1' }
});
RainbowSdk.Operation.fromXDRObject(newSignerXDR1).signer; // $ExpectType Ed25519PublicKey

const newSignerXDR2 = RainbowSdk.Operation.setOptions({
  signer: { sha256Hash: Buffer.from(''), weight: '1' }
});
RainbowSdk.Operation.fromXDRObject(newSignerXDR2).signer; // $ExpectType Sha256Hash

const newSignerXDR3 = RainbowSdk.Operation.setOptions({
  signer: { preAuthTx: '', weight: 1 }
});
RainbowSdk.Operation.fromXDRObject(newSignerXDR3).signer; // $ExpectType PreAuthTx

RainbowSdk.TimeoutInfinite; // $ExpectType 0
