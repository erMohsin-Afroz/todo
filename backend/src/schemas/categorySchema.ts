import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Category name is required.')
    .max(50, 'Category name must not exceed 50 characters.'),

  colour: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex colour.')
    .optional(),
})

export const updateCategorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Category name is required.')
    .max(50, 'Category name must not exceed 50 characters.')
    .optional(),

  colour: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex colour.')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required to update a category.' },
)

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>