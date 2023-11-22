import classNames from 'classnames'

export const Waiting: React.FC<JSX.IntrinsicElements['div'] & {}> = ({
  className
}) => {
  return <div className={classNames('italic', className)}>Waiting...</div>
}
