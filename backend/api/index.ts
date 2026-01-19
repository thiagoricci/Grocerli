import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import listsRouter from '../src/routes/lists'
import recipesRouter from '../src/routes/recipes'
import authRouter from '../src/routes/auth'

// Singleton pattern for Prisma client in serverless environment
const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

const app = express()

app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:8080',
    'https://sous-chefy.vercel.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}))
app.use(express.json())

// Make prisma available to routes
app.use((req: any, res: any, next: any) => {
  req.prisma = prisma
  next()
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/lists', listsRouter)
app.use('/api/recipes', recipesRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
