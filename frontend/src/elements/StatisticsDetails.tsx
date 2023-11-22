import classNames from 'classnames'
import numeral from 'numeral'
import { Side } from 'src/types/enum/side.enum'
import { StatisticsOuputDetails } from 'src/types/interfaces/statistics-output'
import { isROIPositive } from 'src/utils/roi-display'
import { sideDisplay } from 'src/utils/side-display'
import { NoAvailableData } from './NoAvailableData'

type StatisticsDetailsProps = {
  details: StatisticsOuputDetails
}

export const StatisticsDetails: React.FC<StatisticsDetailsProps> = ({
  details
}) => {
  return (
    <div className="p-2 bg-indigo-200">
      {Object.values(Side).map((element) => {
        if (!details[element]) {
          return undefined
        } else {
          return (
            <div className="flex flex-col space-y-2" key={element}>
              <div className="mr-auto font-bold"> {sideDisplay(element)} </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <small>Entry price (avg., min., max.)</small>
                  <div className="space-x-2">
                    <span className="font-medium">
                      {numeral(
                        details[element]?.entryPrice.avgEntryPrice
                      ).format('0,0.0[000]')}
                    </span>
                    <span>
                      {numeral(
                        details[element]?.entryPrice.minEntryPrice
                      ).format('0,0.0[000]')}
                    </span>
                    <span>
                      {numeral(
                        details[element]?.entryPrice.maxEntryPrice
                      ).format('0,0.0[000]')}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <small>ROI (avg., min., max.)</small>
                  {details[element]?.roi.avgRoi ? (
                    <div className="space-x-2">
                      <span
                        className={classNames(
                          details[element]?.roi.avgRoi &&
                            isROIPositive(details[element]?.roi.avgRoi)
                            ? 'text-green-600'
                            : 'text-red-600',
                          'font-medium'
                        )}
                      >
                        {numeral(details[element]?.roi.avgRoi).format('0.0')}%{' '}
                      </span>
                      <span
                        className={classNames(
                          details[element]?.roi.minRoi &&
                            isROIPositive(details[element]?.roi.minRoi)
                            ? 'text-green-600'
                            : 'text-red-600'
                        )}
                      >
                        {numeral(details[element]?.roi.minRoi).format('0.0')}%{' '}
                      </span>
                      <span
                        className={classNames(
                          details[element]?.roi.maxRoi &&
                            isROIPositive(details[element]?.roi.maxRoi)
                            ? 'text-green-600'
                            : 'text-red-600'
                        )}
                      >
                        {numeral(details[element]?.roi.maxRoi).format('0.0')}%
                      </span>
                    </div>
                  ) : (
                    <NoAvailableData />
                  )}
                </div>
                <div className="space-y-1">
                  <small>TP (avg., min., max.)</small>
                  {details[element]?.tp.avgTp !== null ? (
                    <div className="space-x-2">
                      <span className="font-medium">
                        {numeral(details[element]?.tp.avgTp).format(
                          '0,0.0[000]'
                        )}
                      </span>
                      <span>
                        {numeral(details[element]?.tp.minTp).format(
                          '0,0.0[000]'
                        )}
                      </span>
                      <span>
                        {numeral(details[element]?.tp.maxTp).format(
                          '0,0.0[000]'
                        )}
                      </span>
                    </div>
                  ) : (
                    <div>No TP</div>
                  )}
                </div>
                <div className="space-y-1">
                  <small>SL (avg., min., max.)</small>
                  {details[element]?.sl.avgSl !== null ? (
                    <div className="space-x-2">
                      <span className="font-medium">
                        {numeral(details[element]?.sl.avgSl).format(
                          '0,0.0[000]'
                        )}
                      </span>
                      <span>
                        {numeral(details[element]?.sl.minSl).format(
                          '0,0.0[000]'
                        )}
                      </span>
                      <span>
                        {numeral(details[element]?.sl.maxSl).format(
                          '0,0.0[000]'
                        )}
                      </span>
                    </div>
                  ) : (
                    <div>No SL</div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}
