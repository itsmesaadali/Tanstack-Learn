import pg from 'pg' // 1. Explicitly import pg
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

// 2. Create the pool instance manually
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
})

// 3. Pass the pool instance to the adapter
const adapter = new PrismaPg(pool)

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}