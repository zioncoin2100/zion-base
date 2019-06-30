import randomBytes from 'randombytes';

describe('Transaction', function() {
  it('constructs Transaction object from a TransactionEnvelope', function(done) {
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000.0000000';

    let input = new ZionBase.TransactionBuilder(source, { fee: 100 })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .addMemo(ZionBase.Memo.text('Happy birthday!'))
      .setTimeout(ZionBase.TimeoutInfinite)
      .build()
      .toEnvelope()
      .toXDR('base64');

    var transaction = new ZionBase.Transaction(input);
    var operation = transaction.operations[0];

    expect(transaction.source).to.be.equal(source.accountId());
    expect(transaction.fee).to.be.equal(100);
    expect(transaction.memo.type).to.be.equal(ZionBase.MemoText);
    expect(transaction.memo.value.toString('ascii')).to.be.equal(
      'Happy birthday!'
    );
    expect(operation.type).to.be.equal('payment');
    expect(operation.destination).to.be.equal(destination);
    expect(operation.amount).to.be.equal(amount);

    done();
  });

  beforeEach(function() {
    ZionBase.Network.useTestNetwork();
  });

  afterEach(function() {
    ZionBase.Network.use(null);
  });

  it('does not sign when no Network selected', function() {
    ZionBase.Network.use(null);
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000';
    let signer = ZionBase.Keypair.random();

    let tx = new ZionBase.TransactionBuilder(source, { fee: 100 })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .setTimeout(ZionBase.TimeoutInfinite)
      .build();
    expect(() => tx.sign(signer)).to.throw(/No network selected/);
  });

  it('throws when no fee is provided', function() {
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000';

    expect(() =>
      new ZionBase.TransactionBuilder(source)
        .addOperation(
          ZionBase.Operation.payment({ destination, asset, amount })
        )
        .setTimeout(ZionBase.TimeoutInfinite)
        .build()
    ).to.throw(/must specify fee/);
  });

  it('signs correctly', function() {
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000';
    let signer = ZionBase.Keypair.master();

    let tx = new ZionBase.TransactionBuilder(source, { fee: 100 })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .setTimeout(ZionBase.TimeoutInfinite)
      .build();
    tx.sign(signer);

    let env = tx.toEnvelope();

    let rawSig = env.signatures()[0].signature();
    let verified = signer.verify(tx.hash(), rawSig);
    expect(verified).to.equal(true);
  });

  it('signs using hash preimage', function() {
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000';

    let preimage = randomBytes(64);
    let hash = ZionBase.hash(preimage);

    let tx = new ZionBase.TransactionBuilder(source, { fee: 100 })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .setTimeout(ZionBase.TimeoutInfinite)
      .build();
    tx.signHashX(preimage);

    let env = tx.toEnvelope();
    expectBuffersToBeEqual(env.signatures()[0].signature(), preimage);
    expectBuffersToBeEqual(
      env.signatures()[0].hint(),
      hash.slice(hash.length - 4)
    );
  });

  it('returns error when signing using hash preimage that is too long', function() {
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000';

    let preimage = randomBytes(2 * 64);

    let tx = new ZionBase.TransactionBuilder(source, { fee: 100 })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .setTimeout(ZionBase.TimeoutInfinite)
      .build();

    expect(() => tx.signHashX(preimage)).to.throw(
      /preimage cannnot be longer than 64 bytes/
    );
  });

  it('adds signature correctly', function() {
    const sourceKey =
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB';
    // make two sources so they have the same seq number
    const signedSource = new ZionBase.Account(sourceKey, '20');
    const addedSignatureSource = new ZionBase.Account(sourceKey, '20');
    const destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    const asset = ZionBase.Asset.native();
    const amount = '2000';
    const signer = ZionBase.Keypair.master();

    const signedTx = new ZionBase.TransactionBuilder(signedSource, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569
      },
      fee: 100
    })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .build();

    const presignHash = signedTx.hash();
    signedTx.sign(signer);

    const envelopeSigned = signedTx.toEnvelope();

    const addedSignatureTx = new ZionBase.TransactionBuilder(
      addedSignatureSource,
      {
        timebounds: {
          minTime: 0,
          maxTime: 1739392569
        },
        fee: 100
      }
    )
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .build();

    const signature = signer.sign(presignHash).toString('base64');

    addedSignatureTx.addSignature(signer.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx.toEnvelope();

    expect(
      signer.verify(
        addedSignatureTx.hash(),
        envelopeAddedSignature.signatures()[0].signature()
      )
    ).to.equal(true);

    expectBuffersToBeEqual(
      envelopeSigned.signatures()[0].signature(),
      envelopeAddedSignature.signatures()[0].signature()
    );

    expectBuffersToBeEqual(
      envelopeSigned.signatures()[0].hint(),
      envelopeAddedSignature.signatures()[0].hint()
    );

    expectBuffersToBeEqual(addedSignatureTx.hash(), signedTx.hash());
  });

  it('adds signature generated by getKeypairSignature', function() {
    const sourceKey =
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB';
    // make two sources so they have the same seq number
    const signedSource = new ZionBase.Account(sourceKey, '20');
    const addedSignatureSource = new ZionBase.Account(sourceKey, '20');
    const destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    const asset = ZionBase.Asset.native();
    const amount = '2000';
    const signer = ZionBase.Keypair.master();

    const signedTx = new ZionBase.TransactionBuilder(signedSource, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569
      },
      fee: 100
    })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .build();

    const presignHash = signedTx.hash();
    signedTx.sign(signer);

    const envelopeSigned = signedTx.toEnvelope();

    const signature = new ZionBase.Transaction(
      signedTx.toXDR()
    ).getKeypairSignature(signer);

    expect(signer.sign(presignHash).toString('base64')).to.equal(signature);

    const addedSignatureTx = new ZionBase.TransactionBuilder(
      addedSignatureSource,
      {
        timebounds: {
          minTime: 0,
          maxTime: 1739392569
        },
        fee: 100
      }
    )
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .build();

    addedSignatureTx.addSignature(signer.publicKey(), signature);

    const envelopeAddedSignature = addedSignatureTx.toEnvelope();

    expect(
      signer.verify(
        addedSignatureTx.hash(),
        envelopeAddedSignature.signatures()[0].signature()
      )
    ).to.equal(true);

    expectBuffersToBeEqual(
      envelopeSigned.signatures()[0].signature(),
      envelopeAddedSignature.signatures()[0].signature()
    );

    expectBuffersToBeEqual(
      envelopeSigned.signatures()[0].hint(),
      envelopeAddedSignature.signatures()[0].hint()
    );

    expectBuffersToBeEqual(addedSignatureTx.hash(), signedTx.hash());
  });

  it('does not add invalid signature', function() {
    const sourceKey =
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB';
    // make two sources so they have the same seq number
    const source = new ZionBase.Account(sourceKey, '20');
    const sourceCopy = new ZionBase.Account(sourceKey, '20');
    const destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    const asset = ZionBase.Asset.native();
    const originalAmount = '2000';
    const alteredAmount = '1000';
    const signer = ZionBase.Keypair.master();

    const originalTx = new ZionBase.TransactionBuilder(source, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569
      },
      fee: 100
    })
      .addOperation(
        ZionBase.Operation.payment({
          destination,
          asset,
          amount: originalAmount
        })
      )
      .build();

    const signature = new ZionBase.Transaction(
      originalTx.toXDR()
    ).getKeypairSignature(signer);

    const alteredTx = new ZionBase.TransactionBuilder(sourceCopy, {
      timebounds: {
        minTime: 0,
        maxTime: 1739392569
      },
      fee: 100
    })
      .addOperation(
        ZionBase.Operation.payment({
          destination,
          asset,
          amount: alteredAmount
        })
      )
      .build();

    function addSignature() {
      alteredTx.addSignature(signer.publicKey(), signature);
    }
    expect(addSignature).to.throw('Invalid signature');
  });

  it('accepts 0 as a valid transaction fee', function(done) {
    let source = new ZionBase.Account(
      'GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB',
      '0'
    );
    let destination =
      'GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2';
    let asset = ZionBase.Asset.native();
    let amount = '2000';

    let input = new ZionBase.TransactionBuilder(source, { fee: 0 })
      .addOperation(
        ZionBase.Operation.payment({ destination, asset, amount })
      )
      .addMemo(ZionBase.Memo.text('Happy birthday!'))
      .setTimeout(ZionBase.TimeoutInfinite)
      .build()
      .toEnvelope()
      .toXDR('base64');

    var transaction = new ZionBase.Transaction(input);
    var operation = transaction.operations[0];

    expect(transaction.fee).to.be.equal(0);

    done();
  });

  it('outputs xdr as a string', () => {
    const xdrString =
      'AAAAAAW8Dk9idFR5Le+xi0/h/tU47bgC1YWjtPH1vIVO3BklAAAAZACoKlYAAAABAAAAAAAAAAEAAAALdmlhIGtleWJhc2UAAAAAAQAAAAAAAAAIAAAAAN7aGcXNPO36J1I8MR8S4QFhO79T5JGG2ZeS5Ka1m4mJAAAAAAAAAAFO3BklAAAAQP0ccCoeHdm3S7bOhMjXRMn3EbmETJ9glxpKUZjPSPIxpqZ7EkyTgl3FruieqpZd9LYOzdJrNik1GNBLhgTh/AU=';
    const transaction = new ZionBase.Transaction(xdrString);
    expect(typeof transaction).to.be.equal('object');
    expect(typeof transaction.toXDR).to.be.equal('function');
    expect(transaction.toXDR()).to.be.equal(xdrString);
  });
});

function expectBuffersToBeEqual(left, right) {
  let leftHex = left.toString('hex');
  let rightHex = right.toString('hex');
  expect(leftHex).to.eql(rightHex);
}
