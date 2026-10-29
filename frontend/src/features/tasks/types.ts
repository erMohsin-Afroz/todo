export type TaskStatus = {
  id: number
  name: string
  colour: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type TaskCategory = {
  id: number
  name: string
  colour: string
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: number
  title: string
  description: string | null
  statusId: number
  categoryId: number | null
  dueAt: string | null
  reminderAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}