import { apiRequest, type ApiResponse } from '../../../services/api'
import type { TaskCategory } from '../../tasks/types'

export type CategoryInput = {
  name: string
  colour?: string
}

export async function getCategories(): Promise<
  ApiResponse<TaskCategory[]>
> {
  return apiRequest<ApiResponse<TaskCategory[]>>('/categories')
}

export async function createCategory(
  data: CategoryInput,
): Promise<ApiResponse<TaskCategory>> {
  return apiRequest<ApiResponse<TaskCategory>>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCategory(
  id: number,
  data: Partial<CategoryInput>,
): Promise<ApiResponse<TaskCategory>> {
  return apiRequest<ApiResponse<TaskCategory>>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(
  id: number,
): Promise<ApiResponse<null>> {
  return apiRequest<ApiResponse<null>>(`/categories/${id}`, {
    method: 'DELETE',
  })
}