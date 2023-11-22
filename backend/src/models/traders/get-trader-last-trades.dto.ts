import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber } from 'class-validator'
import { FilterTemporalityTraderClassement } from '../filters/filter-temporality-trader-classement.enum'

export class GetTraderLastTradesDto {
  @ApiProperty({
    description: 'Filter by temporality',
    enum: Object.values(FilterTemporalityTraderClassement),
    example: FilterTemporalityTraderClassement.LAST_DAY
  })
  @IsIn([15, 30, 50, 100, 200, 500])
  @IsNumber()
  numberOfTrades?: 15 | 30 | 50 | 100 | 200 | 500
}
