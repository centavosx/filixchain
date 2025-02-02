import { io, Socket } from 'socket.io-client';
import { WsError, WsMineSuccessful, WsNewBlockInfo } from './types/ws';
import { Account, Block, RawBlock, Transaction } from '@ph-blockchain/block';

export class Events {
  private static socket: Socket;

  static connect(url: string) {
    this.socket = io(url, {
      autoConnect: true,
      reconnection: true,
    });
  }

  static initMiner() {
    this.socket.emit('init-miner');
  }

  static initAccount(account: string) {
    this.socket.emit('init-account', { address: account });
  }

  static submitBlock(block: RawBlock & { mintAddress: string }) {
    this.socket.emit('submit-block', block);
  }

  static createErrorListener(cb: (data: WsError) => void) {
    return this.socket.on('error', cb);
  }

  static createNewBlockInfoListener(cb: (data: WsNewBlockInfo) => void) {
    return this.socket.on('new-block-info', cb);
  }

  static createMineSuccessfulListener(cb: (data: WsMineSuccessful) => void) {
    return this.socket.on('mine-success', cb);
  }

  static createTransactionListener(
    cb: (data: ReturnType<Transaction['serialize']>) => void,
  ) {
    return this.socket.on('transaction', cb);
  }

  static createAccountInfoListener(
    cb: (data: ReturnType<Account['serialize']>) => void,
  ) {
    return this.socket.on('accountInfo', cb);
  }

  static createConfirmedBlockListener(
    cb: (data: ReturnType<Block['toJson']>) => void,
  ) {
    return this.socket.on('block', cb);
  }
}
