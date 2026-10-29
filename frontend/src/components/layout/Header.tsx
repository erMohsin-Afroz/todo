type HeaderProps = {
  title?: string
}

function Header({ title = 'My Tasks' }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {title}
        </h1>
      </div>
    </header>
  )
}

export default Header