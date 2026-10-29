import express from 'express'
import cors from 'cors'
import taskRoutes from './routes/taskRoutes.js'
import statusRoutes from './routes/statusRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Todo API is running successfully.',
  })
})

app.use('/api/v1/tasks', taskRoutes)

app.use('/api/v1/statuses', statusRoutes)

app.use('/api/v1/categories', categoryRoutes)

export default app