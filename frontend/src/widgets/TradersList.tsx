import moment from 'moment'
import { useState } from 'react'
import { Button } from 'src/elements/Button'
import { ConfirmationMessage } from 'src/elements/ConfirmationMessage'
import { Modal } from 'src/elements/Modal'
import { ModifyTraderForm } from 'src/elements/ModifyTraderForm'
import { usePagination } from 'src/hooks/usePagination'
import { useDeleteTraderMutation } from 'src/store/rtk/trader'
import { Trader } from 'src/types/interfaces/trader.interface'

type TradersListProps = {
  data: Trader[]
}

export const TradersListTable: React.FC<TradersListProps> = ({ data }) => {
  const {
    data: paginatedData,
    from,
    to,
    hasPrevious,
    previousPage,
    hasNext,
    nextPage
  } = usePagination(data)

  const [deleteTrader] = useDeleteTraderMutation()
  const [deleteTraderModalVisible, setDeleteTraderModalVisible] =
    useState(false)

  const [selectedTrader, setSelectedTrader] = useState<Trader>()

  const [modifyTraderModalVisible, setModifyTraderModalVisible] =
    useState(false)

  const deleteTraderFunc = () => {
    if (selectedTrader) {
      deleteTrader(selectedTrader._id)
      setDeleteTraderModalVisible(false)
    }
  }

  return (
    <>
      <div className="overflow-x-auto relative flex-1 h-full flex flex-col justify-between">
        <table className="w-full text-sm text-left mt-4 mb-4 table-fixed">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 ">
            <tr>
              <th scope="col" className="py-3">
                Name
              </th>
              <th scope="col" className="py-3">
                Added date
              </th>
              <th scope="col" className="py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData &&
              paginatedData.map((element, index) => {
                const addedDate = moment(element.addedDate)
                  .zone('+0100')
                  .format('lll')

                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={element.name}
                  >
                    <th
                      scope="row"
                      className="py-4 font-medium whitespace-nowrap"
                    >
                      <a href={`/trader/${element._id}`}>{element.name}</a>
                    </th>
                    <td className="py-4">{addedDate}</td>
                    <td className="py-4">
                      <div className="flex space-x-2 ml-auto w-min">
                        <Button
                          onClick={() => {
                            setSelectedTrader(element)
                            setModifyTraderModalVisible(true)
                          }}
                        >
                          Modify
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedTrader(element)
                            setDeleteTraderModalVisible(true)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
      <Modal
        title="Delete the trader"
        visible={deleteTraderModalVisible}
        setVisible={setDeleteTraderModalVisible}
      >
        <ConfirmationMessage
          text="Are you sure you want to delete this trader?"
          onAccept={deleteTraderFunc}
          onReject={() => {
            setDeleteTraderModalVisible(false)
          }}
        />
      </Modal>

      <Modal
        title="Modify the trader"
        setVisible={setModifyTraderModalVisible}
        visible={modifyTraderModalVisible}
      >
        <ModifyTraderForm
          setVisible={setModifyTraderModalVisible}
          trader={selectedTrader}
        />
      </Modal>
    </>
  )
}
