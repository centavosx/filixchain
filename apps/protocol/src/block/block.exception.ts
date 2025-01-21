import { HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export class BlockGatewayException extends WsException {
  code: HttpStatus;
  disconnect: boolean;

  constructor(
    message: string | object,
    opts?: { code?: HttpStatus; shouldDisconnect?: boolean },
  ) {
    super(message);
    const { code = HttpStatus.BAD_REQUEST, shouldDisconnect } = opts || {};
    this.code = code;
    this.disconnect = shouldDisconnect;
  }
}
