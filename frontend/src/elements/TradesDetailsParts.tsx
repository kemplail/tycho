import classNames from 'classnames'
import moment from 'moment'
import numeral from 'numeral'
import { useMemo } from 'react'
import { useSetCloseTradeMutation } from 'src/store/rtk/user'
import {
  ClosedTrade,
  OpenTrade
} from 'src/types/interfaces/trades-details-output'
import { isROIPositive } from 'src/utils/roi-display'
import { sideDisplay } from 'src/utils/side-display'
import { isAboutUser } from 'src/utils/table-display'
import { Button } from './Button'
import { NoAvailableData } from './NoAvailableData'

type OpenTradesDetailsTableProps = {
  data: OpenTrade[]
}

export const OpenTradesDetailsTable: React.FC<OpenTradesDetailsTableProps> = ({
  data
}) => {
  const isAboutUserDisplay = useMemo(() => {
    return isAboutUser(data)
  }, [data])

  const [setCloseTrade] = useSetCloseTradeMutation()

  return (
    <>
      {data.map((element, index) => {
        const startedDate = moment(element.startedDate)
          .zone('+0100')
          .format('lll')

        const duration = moment.duration(element.duration, 'minutes')
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

        return (
          <div
            className={`p-2 grid grid-cols-5 ${
              isAboutUserDisplay ? 'lg:grid-cols-11' : 'lg:grid-cols-9'
            } gap-y-4 gap-x-4 h-full overflow-hidden ${
              index % 2 === 0 && 'bg-slate-200'
            }`}
            key={element._id}
          >
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Pair</small>
              </div>
              <div className="mt-auto font-bold">{element.pair.title}</div>
            </div>
            {element.user && (
              <div className="h-full flex flex-col">
                <div className="mb-2">
                  <small>User name</small>
                </div>
                <div className="mt-auto">{element.user.username}</div>
              </div>
            )}
            {element.trader && (
              <div className="h-full flex flex-col">
                <div className="mb-2">
                  <small>Trader name</small>
                </div>
                <div className="mt-auto">{element.trader.name}</div>
              </div>
            )}
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Direction</small>
              </div>
              <div className="mt-auto">{sideDisplay(element.side)}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Entry price</small>
              </div>
              <div className="mt-auto">
                {numeral(element.entryPrice).format('0,0.0[000]')}
              </div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Leverage</small>
              </div>
              <div className="mt-auto">{element.leverage}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Started date</small>
              </div>
              <div className="mt-auto">{startedDate}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>ROI</small>
              </div>
              <div
                className={classNames(
                  'mt-auto',
                  element.roi
                    ? isROIPositive(element.roi)
                      ? 'text-green-600'
                      : 'text-red-600'
                    : ''
                )}
              >
                {element.roi !== null ? (
                  <span>{numeral(element.roi).format('0.00')} %</span>
                ) : (
                  <NoAvailableData />
                )}
              </div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Duration</small>
              </div>
              <div className="mt-auto">{stringDuration}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Size</small>
              </div>
              <div className="mt-auto">{element.size}</div>
            </div>
            {isAboutUserDisplay && (
              <div>
                <Button
                  className="bg-red-400"
                  onClick={() => {
                    setCloseTrade({ tradeId: element._id })
                  }}
                >
                  Close trade
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

type ClosedTradesDetailsTableProps = {
  data: ClosedTrade[]
}

export const ClosedTradesDetailsTable: React.FC<
  ClosedTradesDetailsTableProps
> = ({ data }) => {
  const isAboutUserDisplay = useMemo(() => {
    return isAboutUser(data)
  }, [data])

  return (
    <>
      {data.map((element, index) => {
        const startedDate = moment(element.startedDate)
          .zone('+0100')
          .format('lll')

        const closedDate = moment(element.closedDate)
          .zone('+0100')
          .format('lll')

        const duration = moment.duration(element.duration, 'minutes')
        const days = duration.days()
        duration.subtract(moment.duration(days, 'days'))
        const hours = duration.hours()
        duration.subtract(moment.duration(hours, 'hours'))
        const minutes = duration.minutes()
        duration.subtract(moment.duration(minutes, 'minutes'))

        const stringDuration = `${days}d ${hours}h ${minutes}m`

        return (
          <div
            className={`p-2 grid grid-cols-6 ${
              isAboutUserDisplay ? 'lg:grid-cols-12' : 'lg:grid-cols-11'
            } gap-y-4 gap-x-4 h-full overflow-hidden ${
              index % 2 === 0 && 'bg-slate-200'
            }`}
            key={element._id}
          >
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Pair</small>
              </div>
              <div className="mt-auto font-bold">{element.pair.title}</div>
            </div>
            {element.trader && (
              <div className="h-full flex flex-col">
                <div className="mb-2">
                  <small>Trader name</small>
                </div>
                <div className="mt-auto">{element.trader.name}</div>
              </div>
            )}
            {element.user && (
              <div className="h-full flex flex-col">
                <div className="mb-2">
                  <small>User name</small>
                </div>
                <div className="mt-auto">{element.user.username}</div>
              </div>
            )}
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Direction</small>
              </div>
              <div className="mt-auto">{sideDisplay(element.side)}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Entry price</small>
              </div>
              <div className="mt-auto">
                {numeral(element.entryPrice).format('0,0.0[000]')}
              </div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Closed price</small>
              </div>
              <div className="mt-auto">
                {numeral(element.closedPrice).format('0,0.0[000]')}
              </div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Leverage</small>
              </div>
              <div className="mt-auto">{element.leverage}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Started date</small>
              </div>
              <div className="mt-auto">{startedDate}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Closed date</small>
              </div>
              <div className="mt-auto">{closedDate}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>ROI</small>
              </div>
              <div
                className={classNames(
                  'mt-auto',
                  element.roi && isROIPositive(element.roi)
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {numeral(element.roi).format('0.00')} %
              </div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Duration</small>
              </div>
              <div className="mt-auto">{stringDuration}</div>
            </div>
            <div className="h-full flex flex-col">
              <div className="mb-2">
                <small>Size</small>
              </div>
              <div className="mt-auto">{element.size}</div>
            </div>
          </div>
        )
      })}
    </>
  )
}
