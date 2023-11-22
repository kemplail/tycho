import { useMemo, useState } from 'react'
import { GeneralSelects } from 'src/elements/GeneralSelects'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { StatisticsTable } from 'src/elements/StatisticsTable'
import { Waiting } from 'src/elements/Waiting'
import { useGetStatisticsQuery } from 'src/store/rtk/information'
import { GeneralFeelingTemporality } from 'src/types/enum/general-feeling-temporality.enum'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { TradeType } from 'src/types/enum/trade-type.enum'
import {
  NumberOfTrades,
  NumberOfTradesArray
} from 'src/types/interfaces/number-of-trades'

export const Statistics: React.FC<{}> = () => {
  const [tradeType, setTradeType] = useState<TradeType>(TradeType.TEMPORALITY)

  const [filter, setFilter] = useState<
    GeneralFeelingTemporality | NumberOfTrades
  >()

  const [tradeStatus, setTradeStatus] = useState<TradeStatus>(
    TradeStatus.CLOSED
  )

  const getGeneralFeelingRequestBody = useMemo(
    () => ({
      tradeStatus: tradeStatus,
      type: tradeType,
      numberOfTrades:
        typeof filter === 'number' && NumberOfTradesArray.includes(filter)
          ? filter
          : undefined,
      temporality:
        filter &&
        typeof filter !== 'number' &&
        Object.values(GeneralFeelingTemporality).includes(filter)
          ? filter
          : undefined
    }),
    [filter, tradeStatus, tradeType]
  )

  const { data: tradeStatistics, isFetching: tradeStatisticsisFetching } =
    useGetStatisticsQuery(getGeneralFeelingRequestBody, {
      skip:
        (getGeneralFeelingRequestBody.type === TradeType.TEMPORALITY &&
          !getGeneralFeelingRequestBody.temporality) ||
        (getGeneralFeelingRequestBody.type === TradeType.LAST_TRADES &&
          !getGeneralFeelingRequestBody.numberOfTrades)
    })

  return (
    <>
      <GeneralSelects
        design={'flex-1 h-full grid grid-cols-2 gap-x-4 lg:grid-cols-4 mb-4'}
        filter={filter}
        setFilter={setFilter}
        setTradeStatus={setTradeStatus}
        setTradeType={setTradeType}
        tradeStatus={tradeStatus}
        tradeType={tradeType}
      />

      {tradeStatisticsisFetching ? (
        <Waiting />
      ) : tradeStatistics && Object.keys(tradeStatistics).length > 0 ? (
        <StatisticsTable
          tradeStatistics={tradeStatistics}
          tradeStatus={tradeStatus}
        />
      ) : (
        <NoAvailableData />
      )}
    </>
  )
}
