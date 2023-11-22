import moment from 'moment'
import { Trader } from 'src/types/interfaces/trader.interface'

type TraderGeneralInformationsProps = {
  trader: Trader
}

export const TraderGeneralInformations: React.FC<
  TraderGeneralInformationsProps
> = ({ trader }) => {
  return (
    <div className="p-2">
      <div className="space-y-2 mb-4">
        <div>
          <span className="font-bold">Username : </span>
          <span>{trader.name}</span>
        </div>
        <div>
          <span>Added </span>
          <span className="font-bold">
            {moment(trader.addedDate).fromNow()}
          </span>
        </div>
      </div>
      <div className="mt-4 border-t-2 pt-4">
        {trader.note ? (
          <div>
            <span className="font-bold">Note : </span>
            <span>{trader.note}</span>
          </div>
        ) : (
          <div>
            <span className="font-bold">No note</span>
            <span> about this trader</span>
          </div>
        )}
      </div>
    </div>
  )
}
