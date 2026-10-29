import { apiRequest, type ApiResponse } from '../../../services/api'
import type { Task } from '../types'

export type TaskFilters = {
  statusId?: number
  categoryId?: number
  q?: string
  limit?: number
  cursor?: number
}

export type TaskPagination = {
  limit: number
  nextCursor: number | null
  hasMore: boolean
}

export type TasksResponse = {
  success: boolean
  message: string
  data: Task[]
  pagination: TaskPagination
}

export type TaskInput = {
  title: string
  description?: string | null
  statusId: number
  categoryId?: number | null
  dueAt?: string | null
  reminderAt?: string | null
}

export async function getTasks(
  filters: TaskFilters = {},
): Promise<TasksResponse> {
  const params = new URLSearchParams()

  if (filters.statusId !== undefined) {
    params.set('statusId', String(filters.statusId))
  }

  if (filters.categoryId !== undefined) {
    params.set('categoryId', String(filters.categoryId))
  }

  if (filters.q?.trim()) {
    params.set('q', filters.q.trim())
  }

  if (filters.limit !== undefined) {
    params.set('limit', String(filters.limit))
  }

  if (filters.cursor !== undefined) {
    params.set('cursor', String(filters.cursor))
  }

  const query = params.toString()
  const endpoint = query ? `/tasks?${query}` : '/tasks'

  return apiRequest<TasksResponse>(endpoint)
}

export async function getTaskById(
  id: number,
): Promise<ApiResponse<Task>> {
  return apiRequest<ApiResponse<Task>>(`/tasks/${id}`)
}

export async function createTask(
  task: TaskInput,
): Promise<ApiResponse<Task>> {
  return apiRequest<ApiResponse<Task>>('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

export async function updateTask(
  id: number,
  task: Partial<TaskInput>,
): Promise<ApiResponse<Task>> {
  return apiRequest<ApiResponse<Task>>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(task),
  })
}

export async function deleteTask(
  id: number,
): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/tasks/${id}`, {
    method: 'DELETE',
  })
}