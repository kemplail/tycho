import numeral from 'numeral'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { SubTitle } from 'src/elements/SubTitle'
import { Waiting } from 'src/elements/Waiting'
import { useGetUserBybitInformationsQuery } from 'src/store/rtk/user'
import { UserBybitInformationsOutput } from 'src/types/interfaces/user-bybit-informations-output'

export const TraderUserInformationsBybit: React.FC<{}> = () => {
  const {
    data: userInformationsBybit,
    isFetching: userInformationsBybitIsFetching
  } = useGetUserBybitInformationsQuery()

  return (
    <div className="flex-1 flex flex-col space-y-4">
      <SubTitle text="Bybit informations" />

      {userInformationsBybitIsFetching ? (
        <Waiting />
      ) : userInformationsBybit ? (
        <TraderUserInformationsPart data={userInformationsBybit} />
      ) : (
        <NoAvailableData />
      )}
    </div>
  )
}

type TradesUserInformationsBybitPartProps = {
  data: UserBybitInformationsOutput
}

const TraderUserInformationsPart: React.FC<
  TradesUserInformationsBybitPartProps
> = ({ data }) => {
  return (
    <div className="flex flex-col space-y-2 lg:grid lg:grid-cols-2 lg:space-y-0">
      <div>
        <span className="font-bold text-xl">Total balance : </span>
        {data.total_balance !== null ? (
          <span className="text-xl">
            {numeral(data.total_balance).format('0.0')}$
          </span>
        ) : (
          <NoAvailableData />
        )}
      </div>
      <div>
        <span className="font-bold text-xl">Available balance : </span>
        {data.available_balance !== null ? (
          <span className="text-xl">
            {numeral(data.available_balance).format('0.0')}$
          </span>
        ) : (
          <NoAvailableData />
        )}
      </div>
    </div>
  )
}
