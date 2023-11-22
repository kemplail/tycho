import { Button } from './Button'

type ConfirmationMessageProps = {
  onAccept: VoidFunction
  onReject: VoidFunction
  text: string
}

export const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({
  onAccept,
  onReject,
  text
}) => {
  return (
    <div className="flex flex-col space-y-6 mt-4">
      <div>{text}</div>
      <div className="flex justify-between mb-4">
        <Button onClick={onAccept}>Validate</Button>
        <Button onClick={onReject}>Cancel</Button>
      </div>
    </div>
  )
}
