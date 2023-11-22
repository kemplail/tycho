import Select from 'react-select'
import { useGetTradersRankingQuery } from 'src/store/rtk/information'
import { TraderRankingType } from 'src/types/enum/trader-ranking-type.enum'
import { TraderRankingTemporality } from 'src/types/enum/trader-ranking-temporality.enum'
import {
  getTraderRankingTemporalityLabel,
  getTraderRankingTypeLabel
} from 'src/utils/select-labels'
import { useMemo, useState } from 'react'
import { TradersRankingTable } from 'src/elements/TradersRankingTable'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { Waiting } from 'src/elements/Waiting'

export const TradersRanking: React.FC<{}> = () => {
  const typeOptions = useMemo(
    () =>
      Object.values(TraderRankingType).map((element) => ({
        value: element,
        label: getTraderRankingTypeLabel(element)
      })),
    []
  )

  const temporalityOptions = useMemo(
    () =>
      Object.values(TraderRankingTemporality).map((element) => ({
        value: element,
        label: getTraderRankingTemporalityLabel(element)
      })),
    []
  )

  const [type, setType] = useState<TraderRankingType>(typeOptions[0].value)
  const [temporality, setTemporality] = useState<TraderRankingTemporality>(
    temporalityOptions[2].value
  )

  const { data: traders = [], isFetching: tradersFetching } =
    useGetTradersRankingQuery({
      type: type,
      temporality: temporality
    })

  return (
    <div className="flex-1 h-full flex flex-col">
      <div className="flex space-x-4 mb-4">
        <div className="w-full">
          <small>Type</small>
          <Select
            menuPortalTarget={document.body}
            onChange={(e) => {
              if (e) {
                setType(e.value)
              }
            }}
            isClearable={false}
            defaultValue={typeOptions[0]}
            options={typeOptions}
          />
        </div>
        <div className="w-full">
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

      {tradersFetching ? (
        <Waiting />
      ) : traders.length > 0 ? (
        <TradersRankingTable data={traders} type={type} />
      ) : (
        <NoAvailableData />
      )}
    </div>
  )
}
