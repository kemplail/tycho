import classNames from 'classnames'
import moment from 'moment'
import numeral from 'numeral'
import { useEffect, useMemo, useState } from 'react'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { StatisticsOutputElement } from 'src/types/interfaces/statistics-output'
import { displayPair } from 'src/utils/pair-display'
import { isROIPositive } from 'src/utils/roi-display'
import { Button } from './Button'
import { StatisticsDetails } from './StatisticsDetails'
import { SubTitle } from './SubTitle'
import { TradesListModal } from './TradesListModal'

type SatisticsElementProps = {
  element: StatisticsOutputElement
  tradeStatus: TradeStatus
  index: number
}

export const StatisticsElement: React.FC<SatisticsElementProps> = ({
  element,
  tradeStatus,
  index
}) => {
  const infos = useMemo(() => {
    const duration = moment.duration(element.avgDuration, 'minutes')

    const months = duration.months()
    duration.subtract(moment.duration(months, 'months'))
    const days = duration.days()
    duration.subtract(moment.duration(days, 'days'))
    const hours = duration.hours()
    duration.subtract(moment.duration(hours, 'hours'))
    const minutes = duration.minutes()
    duration.subtract(moment.duration(minutes, 'minutes'))

    const stringDuration = `${
      months !== 0 ? `${months}M` : ''
    } ${days}d ${hours}h ${minutes}m`

    let date

    if (tradeStatus === 'OPEN') {
      date = element.lastStartedDate
    } else {
      date = element.lastClosedDate
    }

    return {
      duration: stringDuration,
      date: moment(date).zone('+0100').format('lll')
    }
  }, [element, tradeStatus])

  return tradeStatus === 'CLOSED' ? (
    <ClosedTradesStatistics
      date={infos.date}
      duration={infos.duration}
      element={element}
      index={index}
    />
  ) : (
    <OpenTradesStatistics
      date={infos.date}
      duration={infos.duration}
      element={element}
      index={index}
    />
  )
}

type TradesStatisticsProps = {
  element: StatisticsOutputElement
  duration: string
  date: string
  index: number
}

export const ClosedTradesStatistics: React.FC<TradesStatisticsProps> = ({
  element,
  duration,
  date,
  index
}) => {
  const [tradesListVisible, setTradesListVisible] = useState<boolean>(false)

  return (
    <div>
      <div
        className={`p-2 grid grid-cols-6 lg:grid-cols-12 gap-y-8 gap-x-4 h-full overflow-hidden ${
          index % 2 === 0 && 'bg-slate-200'
        }`}
        key={element.pair._id}
      >
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Pair</small>
          </div>
          <div className="mt-auto font-bold">
            <SubTitle text={displayPair(element.pair.title)} />
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. trades</small>
          </div>
          <div className="mt-auto font-bold">{element.nbOfTrades}</div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. Longs / Shorts</small>
          </div>
          <div className="mt-auto font-bold">
            <span className="text-blue-500">{element.nbOfLongs}</span> /{' '}
            <span className="text-orange-500">{element.nbOfShorts}</span>
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. Wins / Losses</small>
          </div>
          <div className="mt-auto font-bold">
            <span className="text-green-500">{element.won}</span> /{' '}
            <span className="text-red-500">{element.lost}</span>
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Profit (avg., cum.)</small>
          </div>
          <div className="mt-auto flex flex-wrap gap-x-2">
            <span className="font-medium">
              {numeral(element.avgProfit).format('0.0[00]')}$
            </span>
            <span>{numeral(element.cumProfit).format('0.0[00]')}$</span>
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Quantity (avg., cum.)</small>
          </div>
          <div className="mt-auto flex flex-wrap gap-x-2">
            <span className="font-medium">
              {numeral(element.avgQty).format('0.00[00]')}
            </span>
            <span>{numeral(element.cumQty).format('0.00[00]')}</span>
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Avg. ROI</small>
          </div>
          <div
            className={classNames(
              'mt-auto',
              element.avgRoi && isROIPositive(element.avgRoi)
                ? 'text-green-600'
                : 'text-red-600'
            )}
          >
            {numeral(element.avgRoi).format('0.00')} %
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Avg. Leverage</small>
          </div>
          <div className="mt-auto">
            {numeral(element.avgLeverage).format('0.0')}
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Avg. Duration</small>
          </div>
          <div className="mt-auto">{duration}</div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Last trade end date</small>
          </div>
          <div className="mt-auto">{date}</div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. traders</small>
          </div>
          <div className="mt-auto">{element.nbOfTraders}</div>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => {
              setTradesListVisible(true)
            }}
          >
            Trades
          </Button>
        </div>
      </div>
      <TradesListModal
        trades={element.trades}
        visible={tradesListVisible}
        setVisible={setTradesListVisible}
      />
    </div>
  )
}

export const OpenTradesStatistics: React.FC<TradesStatisticsProps> = ({
  element,
  duration,
  date,
  index
}) => {
  const [isDetails, setIsDetails] = useState(false)

  const onDetailsClick = () => {
    setIsDetails(!isDetails)
  }

  useEffect(() => {
    setIsDetails(false)
  }, [element])

  const [tradesListVisible, setTradesListVisible] = useState<boolean>(false)

  return (
    <div>
      <div
        className={`p-2 grid grid-cols-5 lg:grid-cols-9 gap-y-8 gap-x-4 h-full overflow-hidden ${
          index % 2 === 0 && 'bg-slate-200'
        }`}
        key={element.pair._id}
      >
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Pair</small>
          </div>
          <div className="mt-auto font-bold">
            <SubTitle text={displayPair(element.pair.title)} />
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. trades</small>
          </div>
          <div className="mt-auto font-bold">{element.nbOfTrades}</div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. Longs / Shorts</small>
          </div>
          <div className="mt-auto font-bold">
            <span className="text-blue-500">{element.nbOfLongs}</span> /{' '}
            <span className="text-orange-500">{element.nbOfShorts}</span>
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Quantity (avg., cum.)</small>
          </div>
          <div className="mt-auto flex flex-wrap gap-x-2">
            <span className="font-medium">
              {numeral(element.avgQty).format('0.00[00]')}
            </span>
            <span>{numeral(element.cumQty).format('0.00[00]')}</span>
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Avg. Leverage</small>
          </div>
          <div className="mt-auto">
            {numeral(element.avgLeverage).format('0.0')}
          </div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Avg. Duration</small>
          </div>
          <div className="mt-auto">{duration}</div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Last trade started date</small>
          </div>
          <div className="mt-auto">{date}</div>
        </div>
        <div className="h-full flex flex-col">
          <div className="mb-2">
            <small>Nb. traders</small>
          </div>
          <div className="mt-auto">{element.nbOfTraders}</div>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <div className="flex flex-col space-y-1 ml-auto w-min">
            <Button className="whitespace-nowrap" onClick={onDetailsClick}>
              {isDetails ? '-' : '+'} Details
            </Button>
            <Button
              onClick={() => {
                setTradesListVisible(true)
              }}
            >
              Trades
            </Button>
          </div>
        </div>
      </div>
      {element.details && isDetails && (
        <StatisticsDetails details={element.details} />
      )}
      <TradesListModal
        trades={element.trades}
        visible={tradesListVisible}
        setVisible={setTradesListVisible}
      />
    </div>
  )
}
