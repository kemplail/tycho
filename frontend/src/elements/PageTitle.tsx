type PageTitleProps = {
  text: string
}

export const PageTitle: React.FC<PageTitleProps> = ({ text }) => {
  return <h1 className="text-blue-600 text-3xl mb-6 text-center">{text}</h1>
}
