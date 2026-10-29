import { Router } from 'express'
import {
  getAllCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/categoryController.js'

const router = Router()

router.get('/', getAllCategoriesController)

router.post('/', createCategoryController)

router.patch('/:id', updateCategoryController)

router.delete('/:id', deleteCategoryController)

export default router