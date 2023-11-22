import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { FilterTemporalityTraderClassement } from '../filters/filter-temporality-trader-classement.enum'

export class GetTraderInfosDto {
  @ApiProperty({
    description: 'Filter by temporality',
    enum: Object.values(FilterTemporalityTraderClassement),
    example: FilterTemporalityTraderClassement.LAST_DAY
  })
  @IsIn(Object.values(FilterTemporalityTraderClassement))
  temporality: FilterTemporalityTraderClassement
}
