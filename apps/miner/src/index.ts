import { Crypto } from '@ph-blockchain/hash';
import { Miner } from './miner';

const keyPairs = Crypto.generateKeyPairs();
const address = Crypto.generateWalletAddress(keyPairs.publicKey);
console.log('ADDRESS: ' + address);
const miner = new Miner(address);
miner.connect();
