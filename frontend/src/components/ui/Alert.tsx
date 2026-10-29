type AlertProps = {
  message: string
  type?: 'success' | 'error' | 'info'
}

function Alert({ message, type = 'info' }: AlertProps) {
  let alertClass = 'rounded-lg border p-3 text-sm'

  if (type === 'success') {
    alertClass += ' border-green-200 bg-green-50 text-green-700'
  } else if (type === 'error') {
    alertClass += ' border-red-200 bg-red-50 text-red-700'
  } else {
    alertClass += ' border-blue-200 bg-blue-50 text-blue-700'
  }

  return (
    <div className={alertClass} role={type === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  )
}

export default Alert