import { useGetTradesDetailsQuery } from 'src/store/rtk/information'
import { Modal } from './Modal'
import { TradesDetails } from './TradesDetails'

type TradesListModalProps = {
  trades: string[]
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const TradesListModal: React.FC<TradesListModalProps> = ({
  trades,
  setVisible,
  visible
}) => {
  const { data: tradesDetails, isFetching: tradesDetailsIsFetching } =
    useGetTradesDetailsQuery({ trades: trades })

  if (tradesDetails) {
    return (
      <Modal title="Trades details" setVisible={setVisible} visible={visible}>
        <div className="mt-4">
          <TradesDetails tradesDetails={tradesDetails} />
        </div>
      </Modal>
    )
  } else {
    return null
  }
}
