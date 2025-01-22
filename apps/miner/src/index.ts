import { Block, Blockchain } from '@ph-blockchain/block';
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000');

socket.connect();

socket.on('connect', () => {
  socket.emit('init-miner');
});

socket.on(
  'new-block-info',
  (data: {
    isAvailable: boolean;
    details?: {
      transaction: string[];
      activeBlockHash: string;
      targetHash: string;
      currentHeight: number;
    };
  }) => {
    console.log(typeof data);

    if (!data.isAvailable || !data.details) return;

    const details = data.details;

    const block = new Block(
      Blockchain.version,
      details.currentHeight,
      Date.now(),
      details.transaction,
      details.targetHash,
      details.activeBlockHash,
    );

    block.mine();

    const rawBlock = block.toJson();
    console.log(rawBlock);
    socket.emit('submit-block', rawBlock);
  },
);

socket.on('error', console.log);
