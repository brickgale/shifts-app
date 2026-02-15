import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient({})

interface SeedUser {
  name: string
  email: string
  password: string
  role: string
}

interface SeedShift {
  name: string
  dayOffset: number
  startHour: number
  endHour: number
  userIndex: number
}

interface SeedData {
  users: SeedUser[]
  shifts: SeedShift[]
}

async function main() {
  console.log('🌱 Seeding database...')

  // Read seed data from JSON
  const seedDataPath = join(__dirname, 'seed-data.json')
  const seedData: SeedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'))

  // Create users
  const createdUsers = []
  for (const userData of seedData.users) {
    const hashedPassword = await hash(userData.password, 10)
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role as 'admin' | 'employee',
      },
    })
    createdUsers.push(user)
    console.log(`✅ Created ${userData.role} user: ${user.email}`)
  }

  // Create shifts
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day

  for (const shiftData of seedData.shifts) {
    const shiftDate = new Date(today)
    shiftDate.setDate(shiftDate.getDate() + shiftData.dayOffset)

    const startTime = new Date(shiftDate)
    startTime.setHours(shiftData.startHour, 0, 0, 0)

    const endTime = new Date(shiftDate)
    endTime.setHours(shiftData.endHour, 0, 0, 0)

    // Map userIndex to actual user ID
    const user = createdUsers[shiftData.userIndex]

    await prisma.shift.create({
      data: {
        name: shiftData.name,
        startTime,
        endTime,
        userId: user.id,
      },
    })
  }
  console.log('✅ Created shifts for the week')

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
