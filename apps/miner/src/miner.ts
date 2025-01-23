import { HttpStatus } from '@nestjs/common';
import { Block, Blockchain, Minter } from '@ph-blockchain/block';
import { io } from 'socket.io-client';

export class Miner {
  private socket = io('ws://localhost:3000');
  private currentMiningBlock: Block;

  constructor(private readonly address: string) {}

  connect() {
    this.socket.on('connect', () => {
      this.socket.emit('init-miner');
    });

    this.socket.on(
      'new-block-info',
      async (data: {
        isNewBlock: boolean;
        details: {
          transaction: string[];
          activeBlockHash: string;
          targetHash: string;
          currentHeight: number;
          mintNonce: number;
          currentSupply: number;
        };
      }) => {
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
            Blockchain.version,
            details.currentHeight,
            details.transaction,
            details.targetHash,
            details.activeBlockHash,
          );
        }

        if (!this.currentMiningBlock?.isMined) {
          await this.currentMiningBlock.mine(true);
        }

        if (!this.currentMiningBlock.isMined) return;

        this.socket.emit('submit-block', {
          ...this.currentMiningBlock.toJson(),
          mintAddress: this.address,
        });
      },
    );

    // this.socket.on('error', (e) => {
    //   if (e.statusCode === HttpStatus.BAD_REQUEST) {
    //     console.log(
    //       `\rSomething went wrong with your block. MESSAGE: ${e.data.message}`,
    //     );

    //     return;
    //   }

    //   console.log(`\r${e.data.message}`);
    // });

    this.socket.connect();
  }
}
