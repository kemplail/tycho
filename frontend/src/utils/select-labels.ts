import { GeneralFeelingTemporality } from 'src/types/enum/general-feeling-temporality.enum'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { TradeType } from 'src/types/enum/trade-type.enum'
import { TraderRankingTemporality } from 'src/types/enum/trader-ranking-temporality.enum'
import { TraderRankingType } from 'src/types/enum/trader-ranking-type.enum'

export function getTraderRankingTypeLabel(
  traderRankingType: TraderRankingType
): string {
  switch (traderRankingType) {
    case TraderRankingType.BEST_AVG_PROFIT:
      return 'Best average profit'
    case TraderRankingType.BEST_CUM_PROFIT:
      return 'Best cumulated profit'
    case TraderRankingType.BEST_WINRATE:
      return 'Best winrate'
  }
}

export function getTraderRankingTemporalityLabel(
  traderRankingTemporality: TraderRankingTemporality
): string {
  switch (traderRankingTemporality) {
    case TraderRankingTemporality.ALWAYS:
      return 'Since always'
    case TraderRankingTemporality.LAST_DAY:
      return 'Last day'
    case TraderRankingTemporality.LAST_MONTH:
      return 'Last month'
    case TraderRankingTemporality.LAST_SEVEN_DAYS:
      return 'Seven days'
  }
}

export function getTradeTypesLabel(tradeType: TradeType): string {
  switch (tradeType) {
    case TradeType.TEMPORALITY:
      return 'Temporality'
    case TradeType.LAST_TRADES:
      return 'Last trades'
  }
}

export function getGeneralFeelingTemporalityLabel(
  generalFeelingTemporality: GeneralFeelingTemporality
) {
  switch (generalFeelingTemporality) {
    case GeneralFeelingTemporality.LAST_DAY:
      return 'Last day'
    case GeneralFeelingTemporality.LAST_FOURTEEN_DAYS:
      return 'Last 14 days'
    case GeneralFeelingTemporality.LAST_FOUR_HOURS:
      return 'Last 4 hours'
    case GeneralFeelingTemporality.LAST_HOUR:
      return 'Last hour'
    case GeneralFeelingTemporality.LAST_MONTH:
      return 'Last month'
    case GeneralFeelingTemporality.LAST_SEVEN_DAYS:
      return 'Last 7 days'
    case GeneralFeelingTemporality.LAST_THIRTY_MINUTES:
      return 'Last 30 minutes'
    case GeneralFeelingTemporality.LAST_TWELVE_HOURS:
      return 'Last 12 hours'
  }
}

export function getTradeStatusLabel(tradeStatus: TradeStatus): string {
  switch (tradeStatus) {
    case TradeStatus.OPEN:
      return 'Open'
    case TradeStatus.CLOSED:
      return 'Closed'
  }
}
