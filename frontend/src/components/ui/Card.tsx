import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
