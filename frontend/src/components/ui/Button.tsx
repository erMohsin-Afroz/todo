import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({
  children,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  let buttonClass = 'rounded-lg px-4 py-2 font-medium transition-colors'

  if (variant === 'primary') {
    buttonClass += ' bg-blue-600 text-white hover:bg-blue-700'
  } else if (variant === 'secondary') {
    buttonClass += ' bg-gray-200 text-gray-800 hover:bg-gray-300'
  } else if (variant === 'danger') {
    buttonClass += ' bg-red-600 text-white hover:bg-red-700'
  }

  return (
    <button
      type={type}
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button