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

  // Create employee user
  const employeePassword = await hash('employee123', 10)
  const employee = await prisma.user.upsert({
    where: { email: 'employee@example.com' },
    update: {},
    create: {
      name: 'Employee User',
      email: 'employee@example.com',
      password: employeePassword,
      role: 'employee',
    },
  })
  console.log('✅ Created employee user:', employee.email)

  // Create shifts for employee
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
        userId: employee.id,
      },
      {
        name: 'Evening Shift',
        startTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        endTime: new Date(tomorrow.setHours(23, 0, 0, 0)),
        userId: employee.id,
      },
      {
        name: 'Night Shift',
        startTime: new Date(nextWeek.setHours(23, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(7, 0, 0, 0)),
        userId: employee.id,
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
