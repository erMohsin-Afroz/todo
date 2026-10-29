import Input from '../../../components/ui/Input'

type TaskFiltersProps = {
  searchText: string
  onSearchChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  statuses: { id: number; name: string }[]
  categories: { id: number; name: string }[]
}

function TaskFilters({
  searchText,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  statuses,
  categories,
}: TaskFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
      <Input
        label="Search tasks"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by task title..."
      />

      <div>
        <label
          htmlFor="filter-status"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Filter by status
        </label>

        <select
          id="filter-status"
          value={selectedStatus}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All statuses</option>

          {statuses.map((status) => (
            <option key={status.id} value={String(status.id)}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-category"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Filter by category
        </label>

        <select
          id="filter-category"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default TaskFilters