import { Router } from 'express'
import {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from '../controllers/taskController.js'

const router = Router()

router.get('/', getAllTasksController)

router.post('/', createTaskController)

router.get('/:id', getTaskByIdController)

router.patch('/:id', updateTaskController)

router.delete('/:id', deleteTaskController)

export default router