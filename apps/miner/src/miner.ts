import { Events } from '@ph-blockchain/api';
import { Block, Minter, Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';

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

      console.log('Mining...');

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
        await this.currentMiningBlock.mine();
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
      if (e.statusCode === 400) {
        this.currentMiningBlock = undefined;
      }

      console.log(`\r${e.data.message}`);
    });
  }
}
