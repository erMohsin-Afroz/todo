type LoadingProps = {
  message?: string
}

function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div
      className="flex items-center justify-center gap-3 p-4"
      role="status"
      aria-live="polite"
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>

      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}

export default Loading