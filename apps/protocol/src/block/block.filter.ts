import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { BlockGatewayException } from './block.exception';
import { Socket } from 'socket.io';

@Catch(WsException, HttpException, BlockGatewayException)
export class BlockGatewayFilter extends BaseWsExceptionFilter {
  catch(
    exception: WsException | HttpException | BlockGatewayException,
    host: ArgumentsHost,
  ) {
    const client = host.switchToWs().getClient() as Socket;

    let error: string | object;

    let statusCode = HttpStatus.BAD_REQUEST;
    let shouldDisconnect = false;

    if (exception instanceof WsException) {
      error = exception.getError();
    }

    if (exception instanceof BlockGatewayException) {
      statusCode = exception.code;
      shouldDisconnect = exception.disconnect;
    }

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      error = exception.getResponse();
    }

    const details = typeof error === 'string' ? { message: error } : error;

    client.emit('error', {
      statusCode,
      data: details,
    });

    if (shouldDisconnect) {
      client.disconnect();
    }
  }
}
