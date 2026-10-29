export type TaskFormData = {
  title: string
  description: string
}

export type TaskValidationErrors = {
  title?: string
}

export function validateTask(data: TaskFormData): TaskValidationErrors {
  const errors: TaskValidationErrors = {}

  if (!data.title.trim()) {
    errors.title = 'Task title is required.'
  }

  return errors
}