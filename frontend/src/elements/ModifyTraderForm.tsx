import { useFormik } from 'formik'
import { ChangeEvent, useState } from 'react'
import { TraderSchema } from 'src/schemas/TraderSchema'
import { Trader } from 'src/types/interfaces/trader.interface'
import { ErrorMessage } from './ErrorMessage'
import { ExclamationCircleIcon } from '@heroicons/react/solid'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { ValidMessage } from './ValidMessage'
import { Button } from './Button'
import {
  useAddTraderMutation,
  useUpdateTraderMutation
} from 'src/store/rtk/trader'

type ModifyTraderFormProps = {
  trader?: Trader
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModifyTraderForm: React.FC<ModifyTraderFormProps> = ({
  trader,
  setVisible
}) => {
  const [traderName, setTraderName] = useState(trader?.name || '')
  const [traderLeaderMark, setTraderLeaderMark] = useState(
    trader?.leaderMark || ''
  )
  const [traderNote, setTraderNote] = useState(trader?.note || '')

  const formik = useFormik({
    initialValues: {
      name: trader?.name || '',
      leadermark: trader?.leaderMark || '',
      note: trader?.note || ''
    },
    validateOnMount: true,
    validationSchema: TraderSchema,
    onSubmit: handleOnSubmit
  })

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setTraderName(event.target.value)
    formik.handleChange(event)
  }

  function handleLeaderMarkChange(event: ChangeEvent<HTMLInputElement>) {
    setTraderLeaderMark(event.target.value)
    formik.handleChange(event)
  }

  function handleNoteChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setTraderNote(event.target.value)
    formik.handleChange(event)
  }

  function cancel() {
    setTraderName(trader?.name || '')
    setTraderLeaderMark(trader?.leaderMark || '')
    setTraderNote(trader?.note || '')
    setVisible(false)
  }

  const [updateTrader] = useUpdateTraderMutation()
  const [addTrader] = useAddTraderMutation()

  function handleOnSubmit() {
    let traderToUse

    if (trader) {
      const { name, leaderMark, note, ...actualTrader } = trader
      traderToUse = {
        ...actualTrader,
        name: traderName,
        leaderMark: traderLeaderMark,
        note: traderNote
      }
      updateTrader(traderToUse)
    } else {
      traderToUse = {
        name: traderName,
        leaderMark: traderLeaderMark,
        note: traderNote
      }
      addTrader(traderToUse)
    }

    setVisible(false)
  }

  return (
    <div className="flex flex-col space-y-6 mt-4">
      <form onSubmit={formik.handleSubmit}>
        {formik.errors.name ? (
          <ErrorMessage>
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{formik.errors.name}</span>
          </ErrorMessage>
        ) : (
          <ValidMessage>
            <CheckCircleIcon className="h-5 w-5" />
            <span>Valid name</span>
          </ValidMessage>
        )}

        <div className="mb-2">
          <label htmlFor="name"> Name </label> <br />
          <input
            onChange={handleNameChange}
            name="name"
            className="p-3 shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md"
            value={traderName}
          />
        </div>

        {formik.errors.leadermark ? (
          <ErrorMessage>
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{formik.errors.leadermark}</span>
          </ErrorMessage>
        ) : (
          <ValidMessage>
            <CheckCircleIcon className="h-5 w-5" />
            <span>Valid leaderMark</span>
          </ValidMessage>
        )}

        <div className="mb-2">
          <label htmlFor="leadermark"> LeaderMark </label> <br />
          <input
            onChange={handleLeaderMarkChange}
            name="leadermark"
            className="p-3 shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md"
            value={traderLeaderMark}
          />
        </div>

        {formik.errors.note ? (
          <ErrorMessage>
            <ExclamationCircleIcon className="h-5 w-5" />
            <span>{formik.errors.note}</span>
          </ErrorMessage>
        ) : (
          <ValidMessage>
            <CheckCircleIcon className="h-5 w-5" />
            <span>Valid Note</span>
          </ValidMessage>
        )}

        <div className="mt-2 mb-4">
          <label htmlFor="note">Note</label> <br />
          <textarea
            onChange={handleNoteChange}
            name="note"
            rows={5}
            cols={50}
            className="p-3 shadow-sm block w-full h-30 sm:text-sm border border-gray-300 rounded-md"
            value={traderNote}
          />
        </div>

        <div className="flex justify-between mb-4">
          <Button type="submit">Validate</Button>
          <Button type="button" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
