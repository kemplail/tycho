import { useMemo, useState } from 'react'
import Chart from 'react-google-charts'
import { Button } from 'src/elements/Button'
import { GeneralSelects } from 'src/elements/GeneralSelects'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { SubTitle } from 'src/elements/SubTitle'
import { TradesListModal } from 'src/elements/TradesListModal'
import { Waiting } from 'src/elements/Waiting'
import { useGetGeneralFeelingQuery } from 'src/store/rtk/information'
import { GeneralFeelingTemporality } from 'src/types/enum/general-feeling-temporality.enum'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { TradeType } from 'src/types/enum/trade-type.enum'
import { GeneralFeelingOutput } from 'src/types/interfaces/general-feeling-output'
import {
  NumberOfTrades,
  NumberOfTradesArray
} from 'src/types/interfaces/number-of-trades'

export const GeneralFeeling: React.FC<{}> = () => {
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

  const { data: generalFeeling, isFetching: generalFeelingFetching } =
    useGetGeneralFeelingQuery(getGeneralFeelingRequestBody, {
      skip:
        (getGeneralFeelingRequestBody.type === TradeType.TEMPORALITY &&
          !getGeneralFeelingRequestBody.temporality) ||
        (getGeneralFeelingRequestBody.type === TradeType.LAST_TRADES &&
          !getGeneralFeelingRequestBody.numberOfTrades)
    })

  return (
    <>
      <GeneralSelects
        design={'grid grid-cols-2 gap-2 xl:grid-cols-3 mb-4'}
        filter={filter}
        setFilter={setFilter}
        setTradeStatus={setTradeStatus}
        setTradeType={setTradeType}
        tradeStatus={tradeStatus}
        tradeType={tradeType}
      />

      {generalFeelingFetching ? (
        <Waiting />
      ) : generalFeeling ? (
        <GeneralFeelingInfos data={generalFeeling} />
      ) : (
        <NoAvailableData />
      )}
    </>
  )
}

type GeneralFeelingInfosProps = {
  data: GeneralFeelingOutput
}

const GeneralFeelingInfos: React.FC<GeneralFeelingInfosProps> = ({ data }) => {
  const repartitionData = useMemo(() => {
    if (data.proportion) {
      const repartition = data.proportion.map((element) => [
        element.pair.title,
        element.count
      ])
      return [['Pair', 'Number of trades'], ...repartition]
    }
  }, [data])

  const directionData = useMemo(() => {
    if (
      data.generalInformations &&
      (data.generalInformations.nbOfShorts !== 0 ||
        data.generalInformations.nbOfLongs !== 0)
    ) {
      return [
        ['Direction', 'Number of trades'],
        ['Shorts', data.generalInformations.nbOfShorts],
        ['Longs', data.generalInformations.nbOfLongs]
      ]
    }
  }, [data])

  const directionOptions = {
    responsive: true,
    pieSliceText: 'label',
    legend: 'none',
    chartArea: {
      left: 10,
      top: 5,
      width: '88%',
      height: '85%'
    },
    slices: {
      0: { color: 'red' },
      1: { color: 'green' }
    }
  }

  const repartitionOptions = {
    responsive: true,
    pieSliceText: 'label',
    legend: 'none',
    chartArea: {
      top: 5,
      width: '88%',
      height: '85%'
    }
  }

  const [tradesListVisible, setTradesListVisible] = useState<boolean>(false)

  return (
    <div className="h-full">
      <TradesListModal
        trades={data.generalInformations.trades}
        visible={tradesListVisible}
        setVisible={setTradesListVisible}
      />

      <div className="flex-1 h-full flex flex-col">
        <div className="grid grid-cols-2">
          <div className="space-y-4 grid place-items-center">
            <SubTitle text="Trades direction" />
            {directionData ? (
              <Chart
                className="ml-auto mr-auto"
                chartType="PieChart"
                data={directionData}
                options={directionOptions}
                width={'90%'}
                height={'250px'}
              />
            ) : (
              <NoAvailableData />
            )}
          </div>
          <div className="space-y-4 grid place-items-center">
            <SubTitle text="Pair repartition" />
            {repartitionData ? (
              <Chart
                className="ml-auto mr-auto"
                chartType="PieChart"
                data={repartitionData}
                options={repartitionOptions}
                width={'90%'}
                height={'250px'}
              />
            ) : (
              <NoAvailableData />
            )}
          </div>
        </div>
        <div className="grid space-x-2 items-end h-full place-items-center mt-4">
          <div className="flex w-full justify-center">
            <div className="flex space-x-2">
              <SubTitle text="Number of involved traders :" />
              {data?.generalInformations.nbOfTraders ? (
                <span className="text-lg font-bold">
                  {data.generalInformations.nbOfTraders}
                </span>
              ) : (
                <NoAvailableData />
              )}
            </div>
            {data?.generalInformations.trades?.length > 0 && (
              <Button
                onClick={() => {
                  setTradesListVisible(true)
                }}
                className="ml-auto"
              >
                Trades
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
