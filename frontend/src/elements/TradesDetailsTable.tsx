import { useEffect } from 'react'
import { usePagination } from 'src/hooks/usePagination'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import {
  ClosedTrade,
  OpenTrade
} from 'src/types/interfaces/trades-details-output'
import { Button } from './Button'
import { NoAvailableData } from './NoAvailableData'
import {
  ClosedTradesDetailsTable,
  OpenTradesDetailsTable
} from './TradesDetailsParts'

type TradesDetailsTableProps = {
  data: OpenTrade[] | ClosedTrade[]
  tradeStatus: TradeStatus
}

export const TradesDetailsTable: React.FC<TradesDetailsTableProps> = ({
  data,
  tradeStatus
}) => {
  const {
    data: paginatedData,
    from,
    to,
    hasPrevious,
    previousPage,
    hasNext,
    nextPage
  } = usePagination(data)

  return data && paginatedData ? (
    <div>
      <div className="mb-4 mt-4 border rounded-md">
        {tradeStatus === TradeStatus.CLOSED ? (
          <ClosedTradesDetailsTable data={paginatedData as ClosedTrade[]} />
        ) : (
          <OpenTradesDetailsTable data={paginatedData as OpenTrade[]} />
        )}
      </div>
      <div className="flex justify-between items-end">
        <small>
          <strong>{from}</strong> à <strong>{to}</strong> sur{' '}
          <strong>{data.length}</strong> résultats
        </small>
        <div className="space-x-2">
          <Button disabled={!hasPrevious} onClick={previousPage}>
            {'<< Précédent'}
          </Button>
          <Button disabled={!hasNext} onClick={nextPage}>
            {'Suivant >>'}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <NoAvailableData />
  )
}
