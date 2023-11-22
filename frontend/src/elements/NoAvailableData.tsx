import classNames from 'classnames'

export const NoAvailableData: React.FC<JSX.IntrinsicElements['div'] & {}> = ({
  className
}) => {
  return (
    <div className={classNames('italic', className)}>No available data</div>
  )
}
