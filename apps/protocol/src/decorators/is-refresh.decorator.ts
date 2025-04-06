import { SetMetadata } from '@nestjs/common';

export const IsRefresh = () => SetMetadata('token-refresh', true);
