import classNames from 'classnames'

type ButtonProps = JSX.IntrinsicElements['div'] & {
  children: React.ReactNode
  onClick?: VoidFunction
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset' | undefined
}

export const Button: React.FC<ButtonProps> = ({
  className,
  onClick,
  children,
  disabled,
  type
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={classNames(
        disabled
          ? 'bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded',
        className
      )}
      disabled={disabled ? disabled : false}
    >
      {children}
    </button>
  )
}
