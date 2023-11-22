import classNames from 'classnames'

type PillProps = JSX.IntrinsicElements['div'] & {
  children: React.ReactNode
}

export const Pill: React.FC<PillProps> = ({ children, className }) => {
  return (
    <div className={classNames('p-1 rounded-md', className)}>{children}</div>
  )
}
