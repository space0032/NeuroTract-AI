import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDb, saveDb } from '../db.js'
import { calculateProfile } from '../services/scoringEngine.js'

const router = Router()

// POST /api/profile — Submit questionnaire answers, get profile
router.post('/', async (req, res) => {
  try {
    const { answers } = req.body
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' })
    }

    const profile = calculateProfile(answers)
    const id = uuidv4()

    const db = await getDb()
    db.run(
      `INSERT INTO profiles (id, openness, conscientiousness, extraversion, agreeableness, neuroticism, risk_score, persona, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, profile.openness, profile.conscientiousness, profile.extraversion, profile.agreeableness, profile.neuroticism, profile.riskScore, profile.persona, JSON.stringify(answers)]
    )
    saveDb()

    res.json({ id, ...profile })
  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ error: 'Failed to create profile' })
  }
})

// GET /api/profile/:id — Retrieve a profile
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb()
    const result = db.exec('SELECT * FROM profiles WHERE id = ?', [req.params.id])
    if (!result.length || !result[0].values.length) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const cols = result[0].columns
    const vals = result[0].values[0]
    const profile = {}
    cols.forEach((col, i) => { profile[col] = vals[i] })
    profile.answers = JSON.parse(profile.answers)

    res.json(profile)
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

export default router
