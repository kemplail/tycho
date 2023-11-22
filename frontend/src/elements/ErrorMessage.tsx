import React from 'react'

interface ErrorMessageType {
  children: React.ReactNode
}

export function ErrorMessage(props: ErrorMessageType) {
  return <div className="text-red-700 flex space-x-2">{props.children}</div>
}
