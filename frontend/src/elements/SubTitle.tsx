type SubTitleProps = {
  text: string
}

export const SubTitle: React.FC<SubTitleProps> = ({ text }) => {
  return <h3 className="text-lg text-indigo-700">{text}</h3>
}
