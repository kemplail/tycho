type CardTitleProps = {
  text: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ text }) => {
  return <h2 className="text-xl mb-4 text-indigo-900">{text}</h2>
}
