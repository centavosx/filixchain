import { io, Socket } from 'socket.io-client';
import { WsError, WsMineSuccessful, WsNewBlockInfo } from './types/ws';
import { Account, Block, RawBlock, Transaction } from '@ph-blockchain/block';

export class Events {
  private static socket: Socket;

  static connect(url: string) {
    if (this.socket) return;

    this.socket = io(url, {
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    });
  }

  static initMiner() {
    this.socket.emit('init-miner');
  }

  static initAccount(account: string) {
    this.socket.emit('init-account', { address: account });
    return () => {
      this.socket.emit('leave-account', { address: account });
    };
  }

  static submitBlock(block: RawBlock & { mintAddress: string }) {
    this.socket.emit('submit-block', block);
  }

  static createConnectionListener(cb: () => void) {
    const evt = 'connect';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }

  static createErrorListener(cb: (data: WsError) => void) {
    const evt = 'error';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }

  static createNewBlockInfoListener(cb: (data: WsNewBlockInfo) => void) {
    const evt = 'new-block-info';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }

  static createMineSuccessfulListener(cb: (data: WsMineSuccessful) => void) {
    const evt = 'mine-success';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }

  static createTransactionListener(
    cb: (data: ReturnType<Transaction['serialize']>) => void,
  ) {
    const evt = 'transaction';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }

  static createAccountInfoListener(
    cb: (data: ReturnType<Account['serialize']>) => void,
  ) {
    const evt = 'accountInfo';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }

  static createConfirmedBlockListener(
    cb: (data: ReturnType<Block['toJson']>) => void,
  ) {
    const evt = 'block';
    this.socket.on(evt, cb);
    return () => {
      this.socket.off(evt, cb);
    };
  }
}
