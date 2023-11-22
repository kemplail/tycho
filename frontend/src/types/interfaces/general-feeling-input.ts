import { GeneralFeelingTemporality } from '../enum/general-feeling-temporality.enum'
import { TradeStatus } from '../enum/trade-status.enum'
import { TradeType } from '../enum/trade-type.enum'
import { NumberOfTrades } from './number-of-trades'

export interface GeneralFeelingInput {
  type: TradeType
  temporality?: GeneralFeelingTemporality
  numberOfTrades?: NumberOfTrades
  tradeStatus: TradeStatus
}
