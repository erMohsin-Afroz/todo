import { z } from 'zod'

export const createStatusSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Status name is required.')
    .max(50, 'Status name must not exceed 50 characters.'),

  colour: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex colour.')
    .optional(),

  sortOrder: z.number()
    .int('Sort order must be a whole number.')
    .min(0, 'Sort order cannot be negative.')
    .optional(),
})

export const updateStatusSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Status name is required.')
    .max(50, 'Status name must not exceed 50 characters.')
    .optional(),

  colour: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex colour.')
    .optional(),

  sortOrder: z.number()
    .int('Sort order must be a whole number.')
    .min(0, 'Sort order cannot be negative.')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required to update a status.' },
)

export type CreateStatusInput = z.infer<typeof createStatusSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>