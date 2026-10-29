import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  createStatusSchema,
  updateStatusSchema,
} from '../schemas/statusSchema.js'
import {
  getAllStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from '../services/statusService.js'


function getStatusId(req: Request): number | null {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

export async function getAllStatusesController(
  _req: Request,
  res: Response,
) {
  try {
    const statuses = await getAllStatuses()

    res.status(200).json({
      success: true,
      message: 'Statuses fetched successfully.',
      data: statuses,
    })
  } catch (error: unknown) {
    console.error('Error fetching statuses:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching statuses.',
    })
  }
}

export async function createStatusController(
  req: Request,
  res: Response,
) {
  try {
    const statusData = createStatusSchema.parse(req.body)
    const status = await createStatus(statusData)

    res.status(201).json({
      success: true,
      message: 'Status created successfully.',
      data: status,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Please check the status details.',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    if (error instanceof Error) {
      if (error.message === 'A status with this name already exists.') {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error creating status:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the status.',
    })
  }
}

export async function updateStatusController(
  req: Request,
  res: Response,
) {
  const id = getStatusId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid status ID.',
    })
    return
  }

  try {
    const statusData = updateStatusSchema.parse(req.body)
    const status = await updateStatus(id, statusData)

    res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      data: status,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Please check the status details.',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    if (error instanceof Error) {
      if (error.message === 'Status not found.') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }

      if (error.message === 'A status with this name already exists.') {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error updating status:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while updating the status.',
    })
  }
}

export async function deleteStatusController(
  req: Request,
  res: Response,
) {
  const id = getStatusId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid status ID.',
    })
    return
  }

  try {
    await deleteStatus(id)

    res.status(200).json({
      success: true,
      message: 'Status deleted successfully.',
      data: null,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Status not found.') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }

      if (
        error.message ===
        'Cannot delete a status that is being used by tasks.'
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error deleting status:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting the status.',
    })
  }
}