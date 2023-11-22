import { useMemo } from 'react'
import { usePagination } from 'src/hooks/usePagination'
import { TradeStatus } from 'src/types/enum/trade-status.enum'
import { StatisticsOutput } from 'src/types/interfaces/statistics-output'
import { Button } from './Button'
import { StatisticsElement } from './StatisticsElement'

type StatisticsTableProps = {
  tradeStatistics: StatisticsOutput
  tradeStatus: TradeStatus
}

export const StatisticsTable: React.FC<StatisticsTableProps> = ({
  tradeStatistics,
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
  } = usePagination(Object.keys(tradeStatistics))

  const stats = useMemo(() => {
    if (paginatedData) {
      return paginatedData.map((element, index) => (
        <StatisticsElement
          tradeStatus={tradeStatus}
          element={tradeStatistics[element]}
          index={index}
          key={element}
        />
      ))
    }
  }, [paginatedData, tradeStatistics, tradeStatus])

  return (
    <div>
      <div className="mb-4 mt-4 border rounded-md">
        {stats?.map((element) => element)}
      </div>
      <div className="flex justify-between items-end">
        <small>
          <strong>{from}</strong> à <strong>{to}</strong> sur{' '}
          <strong>{Object.keys(tradeStatistics).length}</strong> résultats
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
  )
}
