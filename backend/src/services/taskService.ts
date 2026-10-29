import prisma from '../db/client.js'
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/taskSchema.js'

export async function createTask(taskData: CreateTaskInput) {
  const status = await prisma.status.findUnique({
    where: { id: taskData.statusId },
  })

  if (!status) {
    throw new Error('The selected status does not exist.')
  }

  if (taskData.categoryId !== undefined && taskData.categoryId !== null) {
    const category = await prisma.category.findUnique({
      where: { id: taskData.categoryId },
    })

    if (!category) {
      throw new Error('The selected category does not exist.')
    }
  }

  return prisma.task.create({
    data: {
      title: taskData.title,
      description: taskData.description,
      statusId: taskData.statusId,
      categoryId: taskData.categoryId,
      dueAt: taskData.dueAt ? new Date(taskData.dueAt) : null,
      reminderAt: taskData.reminderAt
        ? new Date(taskData.reminderAt)
        : null,
    },
    include: {
      status: true,
      category: true,
    },
  })
}

export async function getAllTasks(filters: {
  statusId?: number
  categoryId?: number
  q?: string
  limit: number
  cursor?: number
}) {
  const tasks = await prisma.task.findMany({
    where: {
      ...(filters.statusId !== undefined && {
        statusId: filters.statusId,
      }),

      ...(filters.categoryId !== undefined && {
        categoryId: filters.categoryId,
      }),

      ...(filters.q && {
        OR: [
          { title: { contains: filters.q } },
          { description: { contains: filters.q } },
        ],
      }),
    },
    include: {
      status: true,
      category: true,
    },
    orderBy: {
      id: 'desc',
    },
    ...(filters.cursor !== undefined && {
      cursor: { id: filters.cursor },
      skip: 1,
    }),
    take: filters.limit + 1,
  })

  const hasMore = tasks.length > filters.limit
  const pageTasks = hasMore ? tasks.slice(0, filters.limit) : tasks

  const nextCursor = hasMore
    ? pageTasks[pageTasks.length - 1].id
    : null

  return {
    tasks: pageTasks,
    nextCursor,
    hasMore,
  }
}

export async function getTaskById(id: number) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      status: true,
      category: true,
    },
  })

  if (!task) {
    throw new Error('Task not found.')
  }

  return task
}

export async function updateTask(id: number, taskData: UpdateTaskInput) {
  const existingTask = await prisma.task.findUnique({
    where: { id },
  })

  if (!existingTask) {
    throw new Error('Task not found.')
  }

  if (taskData.statusId !== undefined) {
    const status = await prisma.status.findUnique({
      where: { id: taskData.statusId },
    })

    if (!status) {
      throw new Error('The selected status does not exist.')
    }
  }

  if (taskData.categoryId !== undefined && taskData.categoryId !== null) {
    const category = await prisma.category.findUnique({
      where: { id: taskData.categoryId },
    })

    if (!category) {
      throw new Error('The selected category does not exist.')
    }
  }

  const updateData= {
  title: taskData.title,
  description: taskData.description,
  statusId: taskData.statusId,
  categoryId: taskData.categoryId,
  dueAt: taskData.dueAt
    ? new Date(taskData.dueAt)
    : taskData.dueAt,
  reminderAt: taskData.reminderAt
    ? new Date(taskData.reminderAt)
    : taskData.reminderAt,
}

  if (taskData.title !== undefined) {
    updateData.title = taskData.title
  }

  if (taskData.description !== undefined) {
    updateData.description = taskData.description
  }

  if (taskData.statusId !== undefined) {
    updateData.statusId = taskData.statusId
  }

  if (taskData.categoryId !== undefined) {
    updateData.categoryId = taskData.categoryId
  }

  if (taskData.dueAt !== undefined) {
    updateData.dueAt = taskData.dueAt
      ? new Date(taskData.dueAt)
      : null
  }

  if (taskData.reminderAt !== undefined) {
    updateData.reminderAt = taskData.reminderAt
      ? new Date(taskData.reminderAt)
      : null
  }

  return prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      status: true,
      category: true,
    },
  })
}

export async function deleteTask(id: number) {
  const existingTask = await prisma.task.findUnique({
    where: { id },
  })

  if (!existingTask) {
    throw new Error('Task not found.')
  }

  await prisma.task.delete({
    where: { id },
  })
}