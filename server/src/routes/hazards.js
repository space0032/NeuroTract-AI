import { Router } from 'express'
import { getDb } from '../db.js'

const router = Router()

// Helper to convert sql.js result to array of objects
function rowsToObjects(result) {
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(vals => {
    const obj = {}
    cols.forEach((col, i) => { obj[col] = vals[i] })
    return obj
  })
}

// GET /api/hazards — Return pre-computed hazard events and scenarios
router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const result = db.exec('SELECT * FROM hazard_events ORDER BY video_id, timestamp_ms')

    const scenarios = [
      {
        id: 'intersection_01',
        title: 'Urban Intersection — Pedestrian Crossing',
        description: 'Busy city intersection with sudden pedestrian entry.',
        hazardCount: 3,
      },
      {
        id: 'highway_01',
        title: 'Highway Merge — Erratic Vehicle',
        description: 'Highway on-ramp with dangerous lane change.',
        hazardCount: 2,
      },
      {
        id: 'school_zone_01',
        title: 'School Zone — Child Dash',
        description: 'School zone with children running across the road.',
        hazardCount: 4,
      },
    ]

    res.json({ scenarios, events: rowsToObjects(result) })
  } catch (err) {
    console.error('Hazards error:', err)
    res.status(500).json({ error: 'Failed to get hazards' })
  }
})

export default router
