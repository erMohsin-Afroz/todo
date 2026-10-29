type BadgeProps = {
  text: string
  color?: string
}

function Badge({ text, color = 'bg-blue-100 text-blue-700' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${color}`}
    >
      {text}
    </span>
  )
}

export default Badge