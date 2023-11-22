import { useEffect, useMemo, useState } from 'react'
import { Button } from 'src/elements/Button'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { TradesDetailsTable } from 'src/elements/TradesDetailsTable'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { TradesDetailsOutput } from 'src/types/interfaces/trades-details-output'

type TradesDetailsProps = {
  tradesDetails: TradesDetailsOutput
}

export const TradesDetails: React.FC<TradesDetailsProps> = ({
  tradesDetails
}) => {
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>()

  useEffect(() => {
    if (tradesDetails) {
      if (tradesDetails.open && tradesDetails.open.length > 0) {
        setTradeStatus(TradeStatus.OPEN)
      } else if (tradesDetails.closed && tradesDetails.closed.length > 0) {
        setTradeStatus(TradeStatus.CLOSED)
      }
    }
  }, [tradesDetails])

  const changeTradeStatus = () => {
    if (tradeStatus === TradeStatus.CLOSED) {
      setTradeStatus(TradeStatus.OPEN)
    } else {
      setTradeStatus(TradeStatus.CLOSED)
    }
  }

  const dataToDisplay = useMemo(() => {
    if (
      tradeStatus === TradeStatus.CLOSED &&
      tradesDetails?.closed &&
      tradesDetails?.closed.length > 0
    ) {
      return tradesDetails.closed
    } else if (
      tradeStatus === TradeStatus.OPEN &&
      tradesDetails?.open &&
      tradesDetails?.open.length > 0
    ) {
      return tradesDetails.open
    } else {
      return undefined
    }
  }, [tradesDetails, tradeStatus])

  return (tradesDetails?.open && tradesDetails?.open.length > 0) ||
    (tradesDetails?.closed && tradesDetails?.closed.length > 0) ? (
    <div>
      <div className="flex space-x-1 mb-4">
        {tradesDetails.open && tradesDetails.open.length > 0 && (
          <Button
            onClick={changeTradeStatus}
            disabled={tradeStatus === TradeStatus.OPEN}
          >
            Open trades
          </Button>
        )}
        {tradesDetails.closed && tradesDetails.closed.length > 0 && (
          <Button
            onClick={changeTradeStatus}
            disabled={tradeStatus === TradeStatus.CLOSED}
          >
            Closed trades
          </Button>
        )}
      </div>
      {tradeStatus && dataToDisplay && (
        <TradesDetailsTable
          key={tradeStatus}
          tradeStatus={tradeStatus}
          data={dataToDisplay}
        />
      )}
    </div>
  ) : (
    <NoAvailableData />
  )
}
