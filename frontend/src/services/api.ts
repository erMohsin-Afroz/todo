const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type ApiError = Error & {
  status?: number
  details?: unknown
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      'Connection failed. Check backend is running or not.',
    )
  }

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      result?.message || `Request failed with status ${response.status}`,
    ) as ApiError

    error.status = response.status
    error.details = result?.errors

    throw error
  }

  return result as T
}