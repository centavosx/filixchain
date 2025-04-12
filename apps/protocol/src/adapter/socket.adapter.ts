import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '../config/config.service';

export class SocketAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    port = this.configService.get('WS_PORT');
    const origin = this.configService.get('WS_ALLOWED_ORIGIN');
    options.cors = { origin, credentials: true };
    const server = super.createIOServer(port, options);
    return server;
  }
}
