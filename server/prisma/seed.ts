import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create regular users
  const user1Password = await hash('user123', 10)
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: user1Password,
      role: 'user',
    },
  })
  console.log('✅ Created user:', user1.email)

  const user2Password = await hash('user123', 10)
  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: user2Password,
      role: 'user',
    },
  })
  console.log('✅ Created user:', user2.email)

  // Create shifts
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  await prisma.shift.createMany({
    data: [
      {
        name: 'Morning Shift',
        startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        userId: user1.id,
      },
      {
        name: 'Evening Shift',
        startTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(23, 0, 0, 0)),
        userId: user2.id,
      },
      {
        name: 'Night Shift',
        startTime: new Date(nextWeek.setHours(23, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(7, 0, 0, 0)),
        userId: user1.id,
      },
    ],
  })
  console.log('✅ Created sample shifts')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
