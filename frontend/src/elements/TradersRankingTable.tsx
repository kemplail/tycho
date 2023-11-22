import numeral from 'numeral'
import { useMemo } from 'react'
import { usePagination } from 'src/hooks/usePagination'
import { TraderRankingType } from 'src/types/enum/trader-ranking-type.enum'
import { TraderRanking } from 'src/types/interfaces/trader-ranking'
import { Button } from './Button'

type TradersRankingTableProps = {
  data: TraderRanking[]
  type: TraderRankingType
}

export const TradersRankingTable: React.FC<TradersRankingTableProps> = ({
  data,
  type
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

  const performanceInfos:
    | {
        label: 'winRate' | 'cumProfit' | 'avgProfit'
        metric: string
      }
    | undefined = useMemo(() => {
    switch (type) {
      case 'BEST_WINRATE':
        return {
          label: 'winRate',
          metric: '%'
        }
      case 'BEST_CUM_PROFIT':
        return {
          label: 'cumProfit',
          metric: 'USDT'
        }
      case 'BEST_AVG_PROFIT':
        return {
          label: 'avgProfit',
          metric: 'USDT'
        }
    }
  }, [type])

  return (
    <div className="overflow-x-auto relative flex-1 h-full flex flex-col justify-between">
      <table className="w-full text-sm text-left mt-4 mb-4 table-fixed">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="py-3">
              No.
            </th>
            <th scope="col" className="py-3">
              Name
            </th>
            <th scope="col" className="py-3">
              Performance
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData &&
            paginatedData.map((element, index) => (
              <tr
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                key={element.trader._id}
              >
                <td className="py-4 ">{from + index}</td>
                <th scope="row" className="py-4 font-medium whitespace-nowrap">
                  <a href={`/trader/${element.trader._id}`}>
                    {element.trader.name}
                  </a>
                </th>
                <td className="py-4 ">
                  {performanceInfos &&
                    element[performanceInfos.label] &&
                    `${numeral(element[performanceInfos.label]).format(
                      '0.00'
                    )} ${performanceInfos.metric}`}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
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
  )
}
