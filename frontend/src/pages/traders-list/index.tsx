import { useState } from 'react'
import { Button } from 'src/elements/Button'
import { Card } from 'src/elements/Card'
import { CardTitle } from 'src/elements/CardTitle'
import { Modal } from 'src/elements/Modal'
import { ModifyTraderForm } from 'src/elements/ModifyTraderForm'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { PageTitle } from 'src/elements/PageTitle'
import { Waiting } from 'src/elements/Waiting'
import { useGetAllTradersQuery } from 'src/store/rtk/trader'
import { TradersListTable } from 'src/widgets/TradersList'

function TradersList() {
  const { data: traders, isFetching: tradersIsFetching } =
    useGetAllTradersQuery()

  const [addTraderModalVisible, setAddTraderModalVisible] = useState(false)

  return (
    <>
      <PageTitle text="Traders" />
      <div className="mb-4">
        <Button
          onClick={() => {
            setAddTraderModalVisible(true)
          }}
        >
          Add a trader
        </Button>
      </div>
      <Card className="overflow-hidden flex flex-col">
        <CardTitle text="Traders List" />
        {tradersIsFetching ? (
          <Waiting />
        ) : traders && traders.length > 0 ? (
          <TradersListTable data={traders} />
        ) : (
          <NoAvailableData />
        )}
      </Card>

      <Modal
        title="Add a trader"
        setVisible={setAddTraderModalVisible}
        visible={addTraderModalVisible}
      >
        <ModifyTraderForm setVisible={setAddTraderModalVisible} />
      </Modal>
    </>
  )
}

export default TradersList
