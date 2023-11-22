import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'src/elements/Button'
import { Card } from 'src/elements/Card'
import { CardTitle } from 'src/elements/CardTitle'
import { ConfirmationMessage } from 'src/elements/ConfirmationMessage'
import { Modal } from 'src/elements/Modal'
import { ModifyTraderForm } from 'src/elements/ModifyTraderForm'
import { PageTitle } from 'src/elements/PageTitle'
import { Waiting } from 'src/elements/Waiting'
import {
  useDeleteTraderMutation,
  useGetTraderQuery
} from 'src/store/rtk/trader'
import { TraderGeneralInformations } from 'src/widgets/TraderGeneralInformations'
import { TraderLastTrades } from 'src/widgets/TraderLastTrades'
import { TraderPerformances } from 'src/widgets/TraderPerformances'
import { TraderStatistics } from 'src/widgets/TraderStatistics'

type ParamTypes = {
  id: string
}

function TraderPage() {
  const { id } = useParams<ParamTypes>() as ParamTypes

  let navigate = useNavigate()

  const [deleteTraderModalVisible, setDeleteTraderModalVisible] =
    useState(false)
  const [modifyTraderModalVisible, setModifyTraderModalVisible] =
    useState(false)
  const [deleteTrader] = useDeleteTraderMutation()

  const { data: trader, isFetching: traderIsFetching } = useGetTraderQuery(id)

  const deleteTraderFunc = () => {
    deleteTrader(id)
    setDeleteTraderModalVisible(false)
    navigate('/')
  }

  return traderIsFetching ? (
    <Waiting />
  ) : trader ? (
    <>
      <PageTitle text={`Trader ${trader.name}`} />
      <div className="flex justify-between mb-4">
        <Button
          onClick={() => {
            setModifyTraderModalVisible(true)
          }}
        >
          Modify Informations
        </Button>
        <Button
          onClick={() => {
            setDeleteTraderModalVisible(true)
          }}
        >
          Delete the trader
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid lg:grid-cols-6 grid-cols-1 gap-4">
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            <CardTitle text="General informations" />
            <TraderGeneralInformations trader={trader} />
          </Card>
          <Card className="lg:col-span-4 overflow-hidden flex flex-col">
            <CardTitle text="Performances" />
            <TraderPerformances trader={trader} />
          </Card>
          <Card className="lg:col-span-6 flex flex-col">
            <CardTitle text="Statistics" />
            <TraderStatistics traderId={trader._id} />
          </Card>
          <Card className="lg:col-span-6 flex flex-col">
            <CardTitle text="Last trades" />
            <TraderLastTrades traderId={trader._id} />
          </Card>

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
              trader={trader}
            />
          </Modal>
        </div>
      </div>
    </>
  ) : (
    <div>404 Not Found</div>
  )
}

export default TraderPage
