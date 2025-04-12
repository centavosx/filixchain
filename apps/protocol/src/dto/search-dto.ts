import { IsString } from 'class-validator';

export class SearchDto {
  @IsString()
  search: string;
}
