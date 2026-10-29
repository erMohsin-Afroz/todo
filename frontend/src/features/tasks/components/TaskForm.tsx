import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Task, TaskStatus, TaskCategory } from '../types'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

type TaskFormProps = {
  task?: Task
  statuses: TaskStatus[]
  categories: TaskCategory[]
  onSave: (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void
  onCancel: () => void
}

function TaskForm({
  task,
  statuses,
  categories,
  onSave,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [statusId, setStatusId] = useState(task?.statusId ?? statuses[0]?.id ?? 1)
  const [categoryId, setCategoryId] = useState<number | null>(
    task?.categoryId ?? null,
  )
  const [dueAt, setDueAt] = useState(
    task?.dueAt ? task.dueAt.slice(0, 10) : '',
  )
  const [reminderAt, setReminderAt] = useState(
    task?.reminderAt ? task.reminderAt.slice(0, 16) : '',
  )
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    if (statuses.length === 0) {
      setError('Please add a status before creating a task.')
      return
    }

    setError('')

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      statusId,
      categoryId,
      dueAt: dueAt ? new Date(`${dueAt}T00:00:00`).toISOString() : null,
      reminderAt: reminderAt
        ? new Date(reminderAt).toISOString()
        : null,
      completedAt: task?.completedAt ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={error}
        required
      />

      <div>
        <label
          htmlFor="task-description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Enter task details"
        />
      </div>

      <div>
        <label
          htmlFor="task-status"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Status
        </label>

        <select
          id="task-status"
          value={statusId}
          onChange={(event) => setStatusId(Number(event.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        >
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="task-category"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Category
        </label>

        <select
          id="task-category"
          value={categoryId ?? ''}
          onChange={(event) =>
            setCategoryId(event.target.value ? Number(event.target.value) : null)
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">No category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="task-due-date"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Due date
        </label>

        <input
          id="task-due-date"
          type="date"
          value={dueAt}
          onChange={(event) => setDueAt(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="task-reminder"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Reminder
        </label>

        <input
          id="task-reminder"
          type="datetime-local"
          value={reminderAt}
          onChange={(event) => setReminderAt(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}

export default TaskForm