import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const statuses = [
    { name: 'To Do', colour: '#64748b', sortOrder: 1 },
    { name: 'In Progress', colour: '#3b82f6', sortOrder: 2 },
    { name: 'Blocked', colour: '#ef4444', sortOrder: 3 },
    { name: 'Done', colour: '#22c55e', sortOrder: 4 },
  ]

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    })
  }
  const categories = [
    { name: 'Work', colour: '#3b82f6' },
    { name: 'Personal', colour: '#8b5cf6' },
    { name: 'Learning', colour: '#14b8a6' },
    { name: 'Urgent', colour: '#ef4444' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('Default statuses and categories added successfully.')
}

main()
  .catch((error: unknown) => {
    console.error('Error adding initial data:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })