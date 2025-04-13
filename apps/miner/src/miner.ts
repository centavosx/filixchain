import { Events } from '@ph-blockchain/api';
import { Block, Minter, Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';

const NODE_ENV = process.env.MINER_ENV ?? 'development';

export class Miner {
  private currentMiningBlock: Block;
  private readonly address: string;

  constructor(address: string) {
    this.address = Transform.removePrefix(address, Transaction.prefix);
  }

  connect() {
    Events.connect(process.env.WS_URL, {
      ['user-agent']: process.env.MINER_USER_AGENT,
    });

    Events.createConnectionListener(() => {
      console.log('CONNECTED');
      Events.initMiner();
    });

    Events.createNewBlockInfoListener(async (data) => {
      const { details, isNewBlock } = data;

      if (details.currentSupply >= Number(Minter.FIX_MINT)) {
        details.transaction.push(
          new Minter({
            to: this.address,
            version: 1,
            nonce: details.mintNonce,
          }).encode(),
        );
      }

      if (isNewBlock || !this.currentMiningBlock) {
        this.currentMiningBlock?.stopMining();
        this.currentMiningBlock = new Block(
          Block.version,
          details.currentHeight,
          details.transaction,
          details.targetHash,
          details.activeBlockHash,
        );
      }

      if (!this.currentMiningBlock?.isMined) {
        await this.currentMiningBlock.mine(NODE_ENV === 'development');
      }

      if (!this.currentMiningBlock.isMined) return;

      Events.submitBlock({
        ...this.currentMiningBlock.toJson(),
        mintAddress: this.address,
      });
    });

    Events.createMineSuccessfulListener((data) => {
      console.log();
      console.log('==================================================');
      console.log('MINING SUCCESSFUL');
      console.log(`MINED: ${data.hash}`);
      console.log(`REWARD: ${data.earned}`);
      console.log('==================================================');
      console.log();
    });

    Events.createErrorListener((e) => {
      if (e.statusCode === 403) {
        console.log(
          `\rSomething went wrong with your block. MESSAGE: ${e.data.message}`,
        );

        return;
      }

      console.log(`\r${e.data.message}`);
    });
  }
}
