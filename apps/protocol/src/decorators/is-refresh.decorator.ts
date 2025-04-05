import { SetMetadata } from '@nestjs/common';

export const IsRefresh = () => SetMetadata('csrf-refresh', true);
