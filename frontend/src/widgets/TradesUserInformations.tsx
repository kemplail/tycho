import classNames from 'classnames'
import numeral from 'numeral'
import { useMemo, useState } from 'react'
import Select from 'react-select'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { SubTitle } from 'src/elements/SubTitle'
import { Waiting } from 'src/elements/Waiting'
import { useGetUserInformationsQuery } from 'src/store/rtk/user'
import { TraderRankingTemporality } from 'src/types/enum/trader-ranking-temporality.enum'
import { UserInformationsOutput } from 'src/types/interfaces/user-informations-output'
import { isROIPositive } from 'src/utils/roi-display'
import { getTraderRankingTemporalityLabel } from 'src/utils/select-labels'

export const TradesUserInformations: React.FC<{}> = ({}) => {
  const temporalityOptions = useMemo(
    () =>
      Object.values(TraderRankingTemporality).map((element) => ({
        value: element,
        label: getTraderRankingTemporalityLabel(element)
      })),
    []
  )

  const [temporality, setTemporality] = useState<TraderRankingTemporality>(
    temporalityOptions[2].value
  )

  const { data: userInformations, isFetching: userInformationsIsFetching } =
    useGetUserInformationsQuery({ temporality: temporality })

  return (
    <div className="flex-1 h-full flex flex-col space-y-4">
      <SubTitle text="Trades informations" />
      <div>
        <small>Temporality</small>
        <Select
          menuPortalTarget={document.body}
          className="w-full"
          onChange={(e) => {
            if (e) {
              setTemporality(e.value)
            }
          }}
          isClearable={false}
          defaultValue={temporalityOptions[2]}
          options={temporalityOptions}
        />
      </div>

      {userInformationsIsFetching ? (
        <Waiting />
      ) : userInformations ? (
        <TradesUserInformationsPart data={userInformations} />
      ) : (
        <NoAvailableData />
      )}
    </div>
  )
}

type TraderUserInformationsPartProps = {
  data: UserInformationsOutput
}

const TradesUserInformationsPart: React.FC<TraderUserInformationsPartProps> = ({
  data
}) => {
  return (
    <div className="flex flex-col space-y-2 lg:grid lg:grid-cols-2 lg:space-y-0">
      <div className="space-y-2">
        <div className="flex flex-wrap overflow-auto gap-x-1">
          <div className="font-bold">Nb. of trades :</div>
          <span>{data.nbOfTrades}</span>
        </div>
        <div className="flex flex-wrap overflow-auto gap-x-1">
          <div className="font-bold">Winrate :</div>
          {data.winRate !== undefined ? (
            <span>{numeral(data.winRate).format('0.0')}%</span>
          ) : (
            <NoAvailableData />
          )}
        </div>
        <div className="flex flex-wrap overflow-auto gap-x-1">
          <div className="font-bold">Nb. open trades :</div>
          <span>{data.nbOpenTrades}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap overflow-auto gap-x-1">
          <div className="font-bold">Avg. ROI Closed Trades :</div>
          {data.avgRoiClosedTrades ? (
            <span
              className={classNames(
                data.avgRoiClosedTrades &&
                  isROIPositive(data.avgRoiClosedTrades)
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {numeral(data.avgRoiClosedTrades).format('0.00')}%
            </span>
          ) : (
            <NoAvailableData />
          )}
        </div>
        <div className="flex-auto flex flex-wrap overflow-auto gap-x-1">
          <div className="font-bold">Avg. ROI Open Trades :</div>
          {data.avgRoiOpenTrades ? (
            <span
              className={classNames(
                data.avgRoiOpenTrades && isROIPositive(data.avgRoiOpenTrades)
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {numeral(data.avgRoiOpenTrades).format('0.00')}%
            </span>
          ) : (
            <NoAvailableData />
          )}
        </div>
      </div>
    </div>
  )
}
