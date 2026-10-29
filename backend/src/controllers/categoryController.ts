import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import {
  createCategorySchema,
  updateCategorySchema,
} from '../schemas/categorySchema.js'
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js'

function getCategoryId(req: Request): number | null {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return null
  }

  return id
}

export async function getAllCategoriesController(
  _req: Request,
  res: Response,
) {
  try {
    const categories = await getAllCategories()

    res.status(200).json({
      success: true,
      message: 'Categories fetched successfully.',
      data: categories,
    })
  } catch (error: unknown) {
    console.error('Error fetching categories:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching categories.',
    })
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
) {
  try {
    const categoryData = createCategorySchema.parse(req.body)
    const category = await createCategory(categoryData)

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Please check the category details.',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    if (
      error instanceof Error &&
      error.message === 'A category with this name already exists.'
    ) {
      res.status(409).json({
        success: false,
        message: error.message,
      })
      return
    }

    console.error('Error creating category:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the category.',
    })
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response,
) {
  const id = getCategoryId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid category ID.',
    })
    return
  }

  try {
    const categoryData = updateCategorySchema.parse(req.body)
    const category = await updateCategory(id, categoryData)

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Please check the category details.',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
      return
    }

    if (error instanceof Error) {
      if (error.message === 'Category not found.') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }

      if (
        error.message === 'A category with this name already exists.'
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error updating category:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while updating the category.',
    })
  }
}

export async function deleteCategoryController(
  req: Request,
  res: Response,
) {
  const id = getCategoryId(req)

  if (id === null) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid category ID.',
    })
    return
  }

  try {
    await deleteCategory(id)

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
      data: null,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Category not found.') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }

      if (
        error.message ===
        'Cannot delete a category that is being used by tasks.'
      ) {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }
    }

    console.error('Error deleting category:', error)

    res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting the category.',
    })
  }
}