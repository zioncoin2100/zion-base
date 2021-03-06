import { hash } from './hashing';

/**
 * Contains passphrases for common networks:
 * * `Networks.PUBLIC`: `Public Global Zion Network`
 * * `Networks.TESTNET`: `Test SDF Network`
 * @type {{PUBLIC: string, TESTNET: string}}
 */
export const Networks = {
  PUBLIC: 'Public Global Zion Network',
  TESTNET: 'Test SDF Network'
};

let current = null;

/**
 * The Network class provides helper methods to get the passphrase or id for different
 * zion networks.  It also provides the {@link Network.current} class method that returns the network
 * that will be used by this process for the purposes of generating signatures.
 *
 * You should select network your app will use before adding the first signature. You can use the `use`,
 * `usePublicNetwork` and `useTestNetwork` helper methods.
 *
 * Creates a new `Network` object.
 * @constructor
 * @param {string} networkPassphrase Network passphrase
 */
export class Network {
  constructor(networkPassphrase) {
    this._networkPassphrase = networkPassphrase;
  }

  /**
   * Use Zion Public Network
   * @returns {void}
   */
  static usePublicNetwork() {
    this.use(new Network(Networks.PUBLIC));
  }

  /**
   * Use test network.
   * @returns {void}
   */
  static useTestNetwork() {
    this.use(new Network(Networks.TESTNET));
  }

  /**
   * Use network defined by Network object.
   * @param {Network} network Network to use
   * @returns {void}
   */
  static use(network) {
    current = network;
  }

  /**
   * @returns {Network} Currently selected network
   */
  static current() {
    return current;
  }

  /**
   * @returns {string} Network passphrase
   */
  networkPassphrase() {
    return this._networkPassphrase;
  }

  /**
   * @returns {string} Network ID (SHA-256 hash of network passphrase)
   */
  networkId() {
    return hash(this.networkPassphrase());
  }
}
