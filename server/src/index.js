import express from 'express'
import cors from 'cors'
import { getDb } from './db.js'
import profileRoutes from './routes/profile.js'
import hazardRoutes from './routes/hazards.js'
import detectionRoutes from './routes/detections.js'
import analyticsRoutes from './routes/analytics.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/profile', profileRoutes)
app.use('/api/hazards', hazardRoutes)
app.use('/api/detections', detectionRoutes)
app.use('/api/analytics', analyticsRoutes)

// Start
async function start() {
  await getDb()
  console.log('✓ Database initialized')

  app.listen(PORT, () => {
    console.log(`\n  ◆ NeuroTract API Server`)
    console.log(`  → http://localhost:${PORT}`)
    console.log(`  → Ready\n`)
  })
}

start().catch(console.error)
