import type { Task } from '../types'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

type TaskCardProps = {
  task: Task
  statusName: string
  categoryName: string
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onComplete: (task: Task) => void
}

function TaskCard({
  task,
  statusName,
  categoryName,
  onEdit,
  onDelete,
  onComplete,
}: TaskCardProps) {
  const isCompleted = task.completedAt !== null

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'border border-emerald-200 bg-emerald-100 text-emerald-800'

      case 'in progress':
        return 'border border-blue-200 bg-blue-100 text-blue-800'

      case 'to do':
      case 'todo':
        return 'border border-amber-200 bg-amber-100 text-amber-800'

      case 'blocked':
        return 'border border-rose-200 bg-rose-100 text-rose-800'

      default:
        return 'border border-indigo-200 bg-indigo-100 text-indigo-800'
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'personal':
        return 'border border-purple-200 bg-purple-100 text-purple-800'

      case 'work':
        return 'border border-cyan-200 bg-cyan-100 text-cyan-800'

      case 'study':
        return 'border border-pink-200 bg-pink-100 text-pink-800'

      default:
        return 'border border-violet-200 bg-violet-100 text-violet-800'
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-semibold text-gray-900">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 break-words text-sm leading-6 text-gray-600">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${getStatusStyle(statusName)}`}
            >
              {statusName}
            </span>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${getCategoryStyle(categoryName)}`}
            >
              {categoryName}
            </span>
          </div>

          {task.dueAt && (
            <p className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/70 px-3 py-2 text-sm text-indigo-900">
              <span className="font-semibold">Due date:</span>{' '}
              <span className="text-indigo-700">
                {new Date(task.dueAt).toLocaleString()}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>

          <Button
            variant="primary"
            onClick={() => onComplete(task)}
          >
            {isCompleted ? 'Reopen' : 'Complete'}
          </Button>

          <Button
            variant="danger"
            onClick={() => onDelete(task)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default TaskCard