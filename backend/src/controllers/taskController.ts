import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  createTaskSchema,
  updateTaskSchema,
} from '../schemas/taskSchema.js'
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../services/taskService.js'

function getTaskId(req: Request): number | null {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

export async function createTaskController(
  req: Request,
  res: Response,
) {
  try {
    const taskData = createTaskSchema.parse(req.body)
    const task = await createTask(taskData)

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Please check the task details.',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    if (error instanceof Error) {
      if (
        error.message === 'The selected status does not exist.' ||
        error.message === 'The selected category does not exist.'
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error creating task:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the task.',
    })
  }
}

export async function getAllTasksController(
  req: Request,
  res: Response,
) {
  try {
    const statusId = req.query.statusId === undefined
      ? undefined
      : Number(req.query.statusId)

    const categoryId = req.query.categoryId === undefined
      ? undefined
      : Number(req.query.categoryId)

    const cursor = req.query.cursor === undefined
      ? undefined
      : Number(req.query.cursor)

    const q = typeof req.query.q === 'string'
      ? req.query.q.trim()
      : undefined

    const limit = req.query.limit === undefined
      ? 20
      : Number(req.query.limit)

    if (
      (statusId !== undefined &&
        (!Number.isInteger(statusId) || statusId <= 0)) ||
      (categoryId !== undefined &&
        (!Number.isInteger(categoryId) || categoryId <= 0)) ||
      (cursor !== undefined &&
        (!Number.isInteger(cursor) || cursor <= 0)) ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100 ||
      (req.query.q !== undefined && typeof req.query.q !== 'string')
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters.',
      })
      return
    }

    const result = await getAllTasks({
      statusId,
      categoryId,
      cursor,
      q,
      limit,
    })

    res.status(200).json({
      success: true,
      message: 'Tasks fetched successfully.',
      data: result.tasks,
      pagination: {
        limit,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching tasks:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching tasks.',
    })
  }
}

export async function getTaskByIdController(
  req: Request,
  res: Response,
) {
  const id = getTaskId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid task ID.',
    })
    return
  }

  try {
    const task = await getTaskById(id)

    res.status(200).json({
      success: true,
      message: 'Task fetched successfully.',
      data: task,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Task not found.') {
      res.status(404).json({
        success: false,
        message: error.message,
      })
      return
    }

    console.error('Error fetching task:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching the task.',
    })
  }
}

export async function updateTaskController(
  req: Request,
  res: Response,
) {
  const id = getTaskId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid task ID.',
    })
    return
  }

  try {
    const taskData = updateTaskSchema.parse(req.body)
    const task = await updateTask(id, taskData)

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: task,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Please check the task details.',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    if (error instanceof Error) {
      if (error.message === 'Task not found.') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }

      if (
        error.message === 'The selected status does not exist.' ||
        error.message === 'The selected category does not exist.'
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error updating task:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while updating the task.',
    })
  }
}

export async function deleteTaskController(
  req: Request,
  res: Response,
) {
  const id = getTaskId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid task ID.',
    })
    return
  }

  try {
    await deleteTask(id)

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: null,
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Task not found.') {
      res.status(404).json({
        success: false,
        message: error.message,
      })
      return
    }

    console.error('Error deleting task:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting the task.',
    })
  }
}