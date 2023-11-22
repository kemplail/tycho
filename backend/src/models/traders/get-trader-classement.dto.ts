import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { FilterTemporalityTraderClassement } from '../filters/filter-temporality-trader-classement.enum'
import { FilterTraderClassementEnum } from '../filters/filter-trader-classement.enum'

export class GetTraderClassementDto {
  @ApiProperty({
    description: 'Filter by type',
    enum: Object.values(FilterTraderClassementEnum),
    example: FilterTraderClassementEnum.BEST_AVG_PROFIT
  })
  @IsIn(Object.values(FilterTraderClassementEnum))
  type: FilterTraderClassementEnum

  @ApiProperty({
    description: 'Filter by temporality',
    enum: Object.values(FilterTemporalityTraderClassement),
    example: FilterTemporalityTraderClassement.LAST_DAY
  })
  @IsIn(Object.values(FilterTemporalityTraderClassement))
  temporality: FilterTemporalityTraderClassement
}
