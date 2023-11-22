import { useMemo, useState } from 'react'
import Select from 'react-select'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { TraderPerformancePart } from 'src/elements/TraderPerformancePart'
import { Waiting } from 'src/elements/Waiting'
import { useGetTraderInformationsQuery } from 'src/store/rtk/trader'
import { TraderRankingTemporality } from 'src/types/enum/trader-ranking-temporality.enum'
import { Trader } from 'src/types/interfaces/trader.interface'
import { getTraderRankingTemporalityLabel } from 'src/utils/select-labels'

type TraderPerformancesProps = {
  trader: Trader
}

export const TraderPerformances: React.FC<TraderPerformancesProps> = ({
  trader
}) => {
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

  const { data: traderInformations, isFetching: traderInformationsFetching } =
    useGetTraderInformationsQuery({ id: trader._id, temporality: temporality })

  return (
    <div className="flex-1 h-full flex flex-col">
      <div className="grid lg:grid-cols-5 grid-cols-2 mb-4">
        <div className="lg:col-span-2">
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
      </div>

      {traderInformations ? (
        <TraderPerformancePart data={traderInformations} />
      ) : traderInformationsFetching ? (
        <Waiting />
      ) : (
        <NoAvailableData />
      )}
    </div>
  )
}
