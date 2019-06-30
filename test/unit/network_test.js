describe("Network.current()", function() {
  it("defaults network is null", function() {
    expect(ZionBase.Network.current()).to.be.null;
  });
});

describe("Network.useTestNetwork()", function() {
  it("switches to the test network", function() {
    ZionBase.Network.useTestNetwork();
    expect(ZionBase.Network.current().networkPassphrase()).to.equal(ZionBase.Networks.TESTNET)
  });
});

describe("Network.usePublicNetwork()", function() {
  it("switches to the public network", function() {
    ZionBase.Network.usePublicNetwork();
    expect(ZionBase.Network.current().networkPassphrase()).to.equal(ZionBase.Networks.PUBLIC)
  });
});
