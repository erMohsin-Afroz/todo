import prisma from '../db/client.js'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../schemas/categorySchema.js'

async function checkCategoryName(
  name: string,
  currentId?: number,
) {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  const normalizedName = name.trim().toLowerCase()

  const existingCategory = categories.find(
    (category) =>
      category.id !== currentId &&
      category.name.trim().toLowerCase() === normalizedName,
  )

  if (existingCategory) {
    throw new Error('A category with this name already exists.')
  }
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function createCategory(
  categoryData: CreateCategoryInput,
) {
  await checkCategoryName(categoryData.name)

  return prisma.category.create({
    data: {
      name: categoryData.name.trim(),
      colour: categoryData.colour ?? '#64748b',
    },
  })
}

export async function updateCategory(
  id: number,
  categoryData: UpdateCategoryInput,
) {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  })

  if (!existingCategory) {
    throw new Error('Category not found.')
  }

  if (categoryData.name !== undefined) {
    await checkCategoryName(categoryData.name, id)
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(categoryData.name !== undefined && {
        name: categoryData.name.trim(),
      }),
      ...(categoryData.colour !== undefined && {
        colour: categoryData.colour,
      }),
    },
  })
}

export async function deleteCategory(id: number) {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  })

  if (!existingCategory) {
    throw new Error('Category not found.')
  }

  const taskCount = await prisma.task.count({
    where: { categoryId: id },
  })

  if (taskCount > 0) {
    throw new Error(
      'Cannot delete a category that is being used by tasks.',
    )
  }

  await prisma.category.delete({
    where: { id },
  })
}