import { NoAvailableData } from 'src/elements/NoAvailableData'
import { TradesDetails } from 'src/elements/TradesDetails'
import { Waiting } from 'src/elements/Waiting'
import { useGetTraderLastTradesDetailsQuery } from 'src/store/rtk/trader'

type TraderLastTradesProps = {
  traderId: string
}

export const TraderLastTrades: React.FC<TraderLastTradesProps> = ({
  traderId
}) => {
  const { data: tradesDetails, isFetching: tradesDetailsIsFetching } =
    useGetTraderLastTradesDetailsQuery(traderId)

  return tradesDetailsIsFetching ? (
    <Waiting />
  ) : tradesDetails ? (
    <TradesDetails tradesDetails={tradesDetails} />
  ) : (
    <NoAvailableData />
  )
}
