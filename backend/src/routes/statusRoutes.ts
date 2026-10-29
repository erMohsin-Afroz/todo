import { Router } from 'express'
import {
  getAllStatusesController,
  createStatusController,
  updateStatusController,
  deleteStatusController,
} from '../controllers/statusController.js'

const router = Router()

router.get('/', getAllStatusesController)

router.post('/', createStatusController)

router.patch('/:id', updateStatusController)

router.delete('/:id', deleteStatusController)

export default router