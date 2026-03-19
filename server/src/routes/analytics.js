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

function rowToObject(result) {
  const rows = rowsToObjects(result)
  return rows.length ? rows[0] : null
}

// GET /api/analytics/:profileId — Aggregated analytics for a profile
router.get('/:profileId', async (req, res) => {
  try {
    const db = await getDb()
    const { profileId } = req.params

    const profileResult = db.exec('SELECT * FROM profiles WHERE id = ?', [profileId])
    const profile = rowToObject(profileResult)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const detectionsResult = db.exec(
      'SELECT * FROM detections WHERE profile_id = ? ORDER BY detected_at DESC', [profileId]
    )
    const detections = rowsToObjects(detectionsResult)

    const statsResult = db.exec(
      `SELECT object_class, COUNT(*) as count, AVG(confidence) as avg_confidence
       FROM detections WHERE profile_id = ? GROUP BY object_class ORDER BY count DESC`, [profileId]
    )

    const insights = generateInsights(profile)

    res.json({
      profile: { ...profile, answers: JSON.parse(profile.answers) },
      detections: {
        total: detections.length,
        byClass: rowsToObjects(statsResult),
        recent: detections.slice(0, 20),
      },
      insights,
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: 'Failed to get analytics' })
  }
})

function generateInsights(profile) {
  const insights = []

  if (profile.neuroticism > 65) {
    insights.push({
      type: 'warning', trait: 'Neuroticism',
      text: 'High neuroticism correlates with heightened anxiety in traffic situations, potentially leading to delayed hazard responses.',
    })
  }
  if (profile.conscientiousness < 40) {
    insights.push({
      type: 'danger', trait: 'Conscientiousness',
      text: 'Low conscientiousness is associated with reduced attention to driving rules and missed hazard cues.',
    })
  }
  if (profile.extraversion > 70) {
    insights.push({
      type: 'info', trait: 'Extraversion',
      text: 'High extraversion may lead to distraction from passenger interaction or phone use while driving.',
    })
  }
  if (profile.agreeableness > 70) {
    insights.push({
      type: 'success', trait: 'Agreeableness',
      text: 'High agreeableness correlates with more cooperative and predictable driving behavior.',
    })
  }
  if (profile.openness > 65) {
    insights.push({
      type: 'info', trait: 'Openness',
      text: 'High openness may lead to faster adaptation to new road conditions but also risk-taking in unfamiliar routes.',
    })
  }

  return insights
}

export default router
