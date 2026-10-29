import type { ReactNode } from 'react'
import Button from './Button'

type DialogProps = {
  title: string
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
}

function Dialog({
  title,
  children,
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
}: DialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h2
          id="dialog-title"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          {title}
        </h2>

        <div className="mb-6 text-gray-600">{children}</div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          {onConfirm && (
            <Button variant="danger" onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dialog