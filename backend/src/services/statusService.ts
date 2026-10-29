import prisma from '../db/client.js'
import type {
  CreateStatusInput,
  UpdateStatusInput,
} from '../schemas/statusSchema.js'

export async function getAllStatuses() {
  return prisma.status.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
  })
}

async function checkStatusName(
  name: string,
  currentId?: number,
) {
  const statuses = await prisma.status.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  const normalizedName = name.trim().toLowerCase()

  const existingStatus = statuses.find(
    (status) =>
      status.id !== currentId &&
      status.name.trim().toLowerCase() === normalizedName,
  )

  if (existingStatus) {
    throw new Error('A status with this name already exists.')
  }
}

export async function createStatus(statusData: CreateStatusInput) {
  await checkStatusName(statusData.name)

  return prisma.status.create({
    data: {
      name: statusData.name.trim(),
      colour: statusData.colour ?? '#64748b',
      sortOrder: statusData.sortOrder ?? 0,
    },
  })
}

export async function updateStatus(
  id: number,
  statusData: UpdateStatusInput,
) {
  const existingStatus = await prisma.status.findUnique({
    where: { id },
  })

  if (!existingStatus) {
    throw new Error('Status not found.')
  }

  if (statusData.name !== undefined) {
    await checkStatusName(statusData.name, id)
  }

  return prisma.status.update({
    where: { id },
    data: {
      ...(statusData.name !== undefined && {
        name: statusData.name.trim(),
      }),
      ...(statusData.colour !== undefined && {
        colour: statusData.colour,
      }),
      ...(statusData.sortOrder !== undefined && {
        sortOrder: statusData.sortOrder,
      }),
    },
  })
}

export async function deleteStatus(id: number) {
  const existingStatus = await prisma.status.findUnique({
    where: { id },
  })

  if (!existingStatus) {
    throw new Error('Status not found.')
  }

  const taskCount = await prisma.task.count({
    where: { statusId: id },
  })

  if (taskCount > 0) {
    throw new Error('Cannot delete a status that is being used by tasks.')
  }

  await prisma.status.delete({
    where: { id },
  })
}