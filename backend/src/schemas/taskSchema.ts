import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Task title is required.')
    .max(200, 'Task title must not exceed 200 characters.'),

  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters.')
    .optional(),

  statusId: z.number()
    .int('Status ID must be a whole number.')
    .positive('Please select a valid status.'),

  categoryId: z.number()
    .int('Category ID must be a whole number.')
    .positive('Please select a valid category.')
    .nullable()
    .optional(),

  dueAt: z.string()
    .datetime({ offset: true, message: 'Due date must be a valid ISO date.' })
    .nullable()
    .optional(),

  reminderAt: z.string()
    .datetime({ offset: true, message: 'Reminder must be a valid ISO date.' })
    .nullable()
    .optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Task title is required.')
    .max(200, 'Task title must not exceed 200 characters.')
    .optional(),

  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters.')
    .nullable()
    .optional(),

  statusId: z.number()
    .int('Status ID must be a whole number.')
    .positive('Please select a valid status.')
    .optional(),

  categoryId: z.number()
    .int('Category ID must be a whole number.')
    .positive('Please select a valid category.')
    .nullable()
    .optional(),

  dueAt: z.string()
    .datetime({ offset: true, message: 'Due date must be a valid ISO date.' })
    .nullable()
    .optional(),

  reminderAt: z.string()
    .datetime({ offset: true, message: 'Reminder must be a valid ISO date.' })
    .nullable()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required to update a task.' },
)

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>