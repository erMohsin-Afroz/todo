type MobileNavigationProps = {
  activePage: string
  onPageChange: (page: string) => void
}

function MobileNavigation({
  activePage,
  onPageChange,
}: MobileNavigationProps) {
  const pages = ['Tasks', 'Statuses', 'Categories']

  return (
    <nav
      className="fixed bottom-0 left-0 z-40 flex w-full justify-around border-t border-gray-200 bg-white p-3 md:hidden"
      aria-label="Main navigation"
    >
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${
            activePage === page
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-current={activePage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
    </nav>
  )
}

export default MobileNavigation