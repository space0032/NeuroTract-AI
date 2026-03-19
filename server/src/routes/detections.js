import { Router } from 'express'
import { getDb, saveDb } from '../db.js'

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

// POST /api/detections — Save a detection event
router.post('/', async (req, res) => {
  try {
    const { profileId, objectClass, confidence, plateText, bbox } = req.body
    if (!objectClass) {
      return res.status(400).json({ error: 'objectClass is required' })
    }

    const db = await getDb()
    db.run(
      `INSERT INTO detections (profile_id, object_class, confidence, plate_text, bbox_x, bbox_y, bbox_w, bbox_h)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [profileId || null, objectClass, confidence || 0, plateText || null, bbox?.x || 0, bbox?.y || 0, bbox?.w || 0, bbox?.h || 0]
    )
    saveDb()

    res.json({ status: 'saved' })
  } catch (err) {
    console.error('Detection save error:', err)
    res.status(500).json({ error: 'Failed to save detection' })
  }
})

// GET /api/detections — Get detection history
router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const limit = parseInt(req.query.limit) || 100
    const result = db.exec('SELECT * FROM detections ORDER BY detected_at DESC LIMIT ?', [limit])
    res.json(rowsToObjects(result))
  } catch (err) {
    console.error('Get detections error:', err)
    res.status(500).json({ error: 'Failed to get detections' })
  }
})

// GET /api/detections/stats — Get detection stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb()
    const totalResult = db.exec('SELECT COUNT(*) as count FROM detections')
    const total = totalResult.length ? totalResult[0].values[0][0] : 0

    const byClassResult = db.exec(
      'SELECT object_class, COUNT(*) as count, AVG(confidence) as avg_confidence FROM detections GROUP BY object_class ORDER BY count DESC'
    )
    const recentResult = db.exec('SELECT * FROM detections ORDER BY detected_at DESC LIMIT 10')

    res.json({
      total,
      byClass: rowsToObjects(byClassResult),
      recent: rowsToObjects(recentResult),
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

export default router
