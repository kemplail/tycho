import { Dialog, Transition } from '@headlessui/react'
import React from 'react'
import { SubTitle } from './SubTitle'

interface ModalProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  title: string
  children: React.ReactNode
}

export function Modal(props: ModalProps) {
  return (
    <Transition.Root show={props.visible} as={React.Fragment}>
      <Dialog
        onClose={props.setVisible}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-75" />

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-6">
            <Dialog.Title>
              <SubTitle text={props.title} />
            </Dialog.Title>
            {props.children}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
