import { NoAvailableData } from 'src/elements/NoAvailableData'
import { TradesDetails } from 'src/elements/TradesDetails'
import { Waiting } from 'src/elements/Waiting'
import { useGetUserLastTradesDetailsQuery } from 'src/store/rtk/user'

export const UserLastTrades: React.FC<{}> = ({}) => {
  const { data: userTradesDetails, isFetching: usertTradesDetailsIsFetching } =
    useGetUserLastTradesDetailsQuery()

  return usertTradesDetailsIsFetching ? (
    <Waiting />
  ) : userTradesDetails ? (
    <TradesDetails tradesDetails={userTradesDetails} />
  ) : (
    <NoAvailableData />
  )
}
