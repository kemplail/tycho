import {
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator'
import { FilterTemporalityTrades } from '../filters/filter-temporality-trades.enum'
import { FilterTradeStatus } from '../filters/filter-trade-status.enum'
import { FilterTypeTradesEnum } from '../filters/filter-type-trades.enum'

export class GeneralFiltersDto {
  @IsIn(Object.values(FilterTypeTradesEnum))
  @IsString()
  type: FilterTypeTradesEnum

  @ValidateIf((o) => o.type === 'TEMPORALITY')
  @IsIn(Object.values(FilterTemporalityTrades))
  @IsString()
  temporality?: FilterTemporalityTrades

  @ValidateIf((o) => o.type === 'LAST_TRADES')
  @IsIn([15, 30, 50, 100, 200, 500])
  @IsNumber()
  numberOfTrades?: 15 | 30 | 50 | 100 | 200 | 500

  @IsIn(Object.values(FilterTradeStatus))
  @IsString()
  tradeStatus: FilterTradeStatus

  @IsOptional()
  @IsMongoId()
  traderId?: string
}
