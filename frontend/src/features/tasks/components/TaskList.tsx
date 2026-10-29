import type { Task } from '../types'
import TaskCard from './TaskCard'
import Loading from '../../../components/ui/Loading'

type TaskListProps = {
  tasks: Task[]
  statuses: { id: number; name: string }[]
  categories: { id: number; name: string }[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onComplete: (task: Task) => void
}

function TaskList({
  tasks,
  statuses,
  categories,
  isLoading,
  onEdit,
  onDelete,
  onComplete,
}: TaskListProps) {
  if (isLoading) {
    return <Loading message="Loading tasks..." />
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          No tasks found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Create a new task to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const status = statuses.find(
          (item) => item.id === task.statusId,
        )

        const category = categories.find(
          (item) => item.id === task.categoryId,
        )

        return (
          <TaskCard
            key={task.id}
            task={task}
            statusName={status?.name ?? 'Unknown status'}
            categoryName={category?.name ?? 'Unknown category'}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
          />
        )
      })}
    </div>
  )
}

export default TaskList