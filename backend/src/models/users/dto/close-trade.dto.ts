import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CloseTradeDto {
  @ApiProperty()
  @IsString()
  tradeId: string
}
