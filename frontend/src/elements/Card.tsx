import classNames from 'classnames'

type CardProps = JSX.IntrinsicElements['div'] & {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={classNames(
        'p-6 bg-white rounded-md border-solid shadow-md',
        className
      )}
    >
      {children}
    </div>
  )
}
