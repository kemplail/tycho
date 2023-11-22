interface ValidMessageType {
  children: React.ReactNode
}

export function ValidMessage(props: ValidMessageType) {
  return <div className="text-green-700 flex space-x-2">{props.children}</div>
}
