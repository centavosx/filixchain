import { Miner } from './miner';
import * as dotenv from 'dotenv';

const NODE_ENV = process.env.MINER_ENV ?? 'development';

dotenv.config({
  path: NODE_ENV === 'development' ? '.env.development' : '.env',
});

const miner = new Miner(process.env.MINER_WALLET_ADDRESS);
miner.connect();
