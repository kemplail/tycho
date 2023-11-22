import classNames from 'classnames'
import { useEffect, useMemo } from 'react'
import Select from 'react-select'
import { GeneralFeelingTemporality } from 'src/types/enum/general-feeling-temporality.enum'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { TradeType } from 'src/types/enum/trade-type.enum'
import {
  NumberOfTrades,
  NumberOfTradesArray
} from 'src/types/interfaces/number-of-trades'
import {
  getGeneralFeelingTemporalityLabel,
  getTradeStatusLabel,
  getTradeTypesLabel
} from 'src/utils/select-labels'

type GeneralSelectsProps = {
  design: string
  tradeType: TradeType
  setTradeType: React.Dispatch<React.SetStateAction<TradeType>>
  filter: NumberOfTrades | GeneralFeelingTemporality | undefined
  setFilter: React.Dispatch<
    React.SetStateAction<NumberOfTrades | GeneralFeelingTemporality | undefined>
  >
  tradeStatus: TradeStatus
  setTradeStatus: React.Dispatch<React.SetStateAction<TradeStatus>>
}

export const GeneralSelects: React.FC<GeneralSelectsProps> = ({
  filter,
  setFilter,
  setTradeStatus,
  setTradeType,
  tradeStatus,
  tradeType,
  design
}) => {
  const tradeTypeOptions = useMemo(
    () =>
      Object.values(TradeType).map((element) => ({
        value: element,
        label: getTradeTypesLabel(element)
      })),
    []
  )

  const filterOptions:
    | { label: NumberOfTrades; value: NumberOfTrades }[]
    | { label: string; value: GeneralFeelingTemporality }[] = useMemo(() => {
    if (tradeType === TradeType.LAST_TRADES) {
      return NumberOfTradesArray.map((element) => ({
        label: element as NumberOfTrades,
        value: element as NumberOfTrades
      }))
    } else {
      return Object.values(GeneralFeelingTemporality).map((element) => ({
        label: getGeneralFeelingTemporalityLabel(element),
        value: element
      }))
    }
  }, [tradeType])

  const tradeStatusOptions = useMemo(() => {
    return Object.values(TradeStatus).map((element) => ({
      value: element,
      label: getTradeStatusLabel(element)
    }))
  }, [])

  useEffect(() => {
    if (filterOptions) {
      if (tradeType === TradeType.TEMPORALITY) {
        setFilter(GeneralFeelingTemporality.LAST_SEVEN_DAYS)
      } else {
        setFilter(50)
      }
    }
  }, [filterOptions, tradeType, setFilter])

  return (
    <div className={classNames(design)}>
      <div className="w-full">
        <small>Trades type</small>
        <Select
          menuPortalTarget={document.body}
          value={{ value: tradeType, label: getTradeTypesLabel(tradeType) }}
          onChange={(e) => {
            if (e) {
              setTradeType(e.value)
            }
          }}
          isClearable={false}
          options={tradeTypeOptions}
        />
      </div>
      <div className="w-full">
        <small>Filter</small>
        <Select
          menuPortalTarget={document.body}
          value={{
            value: filter,
            label:
              typeof filter === 'number'
                ? filter
                : !filter
                ? undefined
                : getGeneralFeelingTemporalityLabel(filter)
          }}
          onChange={(e) => {
            if (e) {
              setFilter(e.value)
            }
          }}
          isClearable={false}
          options={filterOptions}
        />
      </div>
      <div className="w-full">
        <small>Trades status</small>
        <Select
          menuPortalTarget={document.body}
          isClearable={false}
          options={tradeStatusOptions}
          value={{
            value: tradeStatus,
            label: getTradeStatusLabel(tradeStatus)
          }}
          onChange={(e) => {
            if (e) {
              setTradeStatus(e.value)
            }
          }}
        />
      </div>
    </div>
  )
}
