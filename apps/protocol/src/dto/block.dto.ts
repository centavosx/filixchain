import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppHash } from '@ph-blockchain/hash';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { Transformer } from 'src/utils/transformer';

export type RawBlock = {
  readonly version: string;
  readonly height: number;
  readonly timestamp?: number;
  readonly transactions: string[];
  readonly previousHash: string;
  readonly targetHash: string;
  readonly blockHash: string;
  readonly nonce: number;
  readonly merkleRoot: string;
  readonly transactionSize: number;
};

export type RawBlockDb = {
  version: string;
  height: string;
  timestamp: string;
  transactions: string[];
  previousHash: string;
  targetHash: string;
  blockHash: string;
  nonce: string;
  merkleRoot: string;
  transactionSize: number;
};

export class BlockHeightQuery {
  @ApiPropertyOptional({
    description: 'Start height of the transaction. Defaults to zero',
  })
  @IsOptional()
  @Transform(Transformer.toNumber)
  @IsNumber()
  start?: number;

  @ApiPropertyOptional({
    description:
      'End height of the transaction. Defaults to the latest block height.',
  })
  @IsOptional()
  @Transform(Transformer.toNumber)
  @IsNumber()
  end?: number;

  @ApiPropertyOptional({
    description: 'Set to true if you want to retrieve from latest to oldest',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  reverse?: boolean;

  @ApiPropertyOptional({
    description: 'Total number of rows to . (Defaults to 20)',
  })
  @IsOptional()
  @Transform(Transformer.toNumber)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Set to true if you want to include the encoded tx in the result',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  includeTx?: boolean;
}

export class BlockTransactionQuery {
  @ApiPropertyOptional({
    description: 'Last block height query',
  })
  @IsOptional()
  @Transform(Transformer.toNumber)
  @IsNumber()
  lastBlockHeight?: number;

  @ApiPropertyOptional({
    description: 'Last txIndex query',
  })
  @IsOptional()
  @Transform(Transformer.toNumber)
  @IsNumber()
  nextTxIndex?: number;

  @ApiPropertyOptional({
    description: 'Set to true if you want to retrieve from latest to oldest',
  })
  @IsOptional()
  @Transform(Transformer.toBoolean)
  @IsBoolean()
  reverse?: boolean;

  @ApiPropertyOptional({
    description: 'Total number of rows to. (Defaults to 20)',
  })
  @IsOptional()
  @Transform(Transformer.toNumber)
  @IsNumber()
  limit?: number;
}
