type ContainerProps = {
  children: React.ReactNode
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="max-w-screen-2xl mx-auto py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
