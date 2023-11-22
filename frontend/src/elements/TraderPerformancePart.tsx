import classNames from 'classnames'
import numeral from 'numeral'
import { useMemo, useState } from 'react'
import Chart from 'react-google-charts'
import { TraderInformationsOutput } from 'src/types/interfaces/trader-informations-output'
import { isROIPositive } from '../utils/roi-display'
import { Button } from './Button'
import { NoAvailableData } from './NoAvailableData'
import { SubTitle } from './SubTitle'
import { TradesListModal } from './TradesListModal'

type TraderPerformancePartProps = {
  data: TraderInformationsOutput
}

export const TraderPerformancePart: React.FC<TraderPerformancePartProps> = ({
  data
}) => {
  const repartitionData = useMemo(() => {
    if (data.proportion) {
      const repartition = data.proportion.map((element) => [
        element.pair.title,
        element.count
      ])
      return [['Pair', 'Number of trades'], ...repartition]
    }
  }, [data])

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
    <div>
      <div className="mt-4 grid lg:grid-cols-2 gap-y-6 gap-x-2">
        <div>
          <SubTitle text="Main informations" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-4 mt-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap overflow-auto gap-x-1">
                <div className="font-bold">Nb. of trades :</div>
                <span>{data.nbOfTrades}</span>
              </div>
              <div className="flex flex-wrap overflow-auto gap-x-1">
                <div className="font-bold">Winrate :</div>
                {data.winRate ? (
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
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap overflow-auto gap-x-1">
                <div className="font-bold">Profit (avg., cum.) :</div>
                <div className="space-x-1">
                  <span className="font-medium">
                    {numeral(data.avgProfit).format('0.0[00]')}$
                  </span>
                  <span>{numeral(data.cumProfit).format('0.0[00]')}$</span>
                </div>
              </div>
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
                      data.avgRoiOpenTrades &&
                        isROIPositive(data.avgRoiOpenTrades)
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
        </div>
        <div className="text-center lg:col-span-1 md:col-span-2 mt-2 lg:mt-0 space-y-2">
          <SubTitle text="Pair repartition" />
          {repartitionData ? (
            <Chart
              className="ml-auto mr-auto"
              chartType="PieChart"
              data={repartitionData}
              options={repartitionOptions}
              width={'99%'}
              height={'175px'}
            />
          ) : (
            <NoAvailableData />
          )}
        </div>
      </div>
      <div className="flex">
        <Button
          onClick={() => {
            setTradesListVisible(true)
          }}
          className="ml-auto"
        >
          Trades
        </Button>
      </div>
      <TradesListModal
        trades={data.trades}
        visible={tradesListVisible}
        setVisible={setTradesListVisible}
      />
    </div>
  )
}
