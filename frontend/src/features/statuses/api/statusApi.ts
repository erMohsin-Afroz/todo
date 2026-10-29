import { apiRequest, type ApiResponse } from '../../../services/api'
import type { TaskStatus } from '../../tasks/types'

export type StatusInput = {
  name: string
  colour?: string
  sortOrder?: number
}

export async function getStatuses(): Promise<ApiResponse<TaskStatus[]>> {
  return apiRequest<ApiResponse<TaskStatus[]>>('/statuses')
}

export async function createStatus(
  data: StatusInput,
): Promise<ApiResponse<TaskStatus>> {
  return apiRequest<ApiResponse<TaskStatus>>('/statuses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateStatus(
  id: number,
  data: Partial<StatusInput>,
): Promise<ApiResponse<TaskStatus>> {
  return apiRequest<ApiResponse<TaskStatus>>(`/statuses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteStatus(
  id: number,
): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/statuses/${id}`, {
    method: 'DELETE',
  })
}