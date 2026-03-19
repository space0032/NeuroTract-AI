/**
 * Scoring Engine
 * Maps questionnaire answers → Big Five dimensions → risk persona
 *
 * Questions layout (25 total):
 *  Q0-Q4:   Openness
 *  Q5-Q9:   Conscientiousness
 *  Q10-Q14: Extraversion
 *  Q15-Q19: Agreeableness
 *  Q20-Q24: Neuroticism
 *
 * Each answer is 1-5 (Likert scale: Strongly Disagree → Strongly Agree)
 */

const DIMENSION_MAP = [
  { name: 'openness', start: 0, end: 5, reversed: [1, 3] },
  { name: 'conscientiousness', start: 5, end: 10, reversed: [6, 8] },
  { name: 'extraversion', start: 10, end: 15, reversed: [11, 13] },
  { name: 'agreeableness', start: 15, end: 20, reversed: [16, 18] },
  { name: 'neuroticism', start: 20, end: 25, reversed: [21, 23] },
]

function scoreDimension(answers, dim) {
  let total = 0
  for (let i = dim.start; i < dim.end; i++) {
    const raw = answers[i] || 3
    const score = dim.reversed.includes(i) ? (6 - raw) : raw
    total += score
  }
  // Normalize to 0-100
  return Math.round(((total - 5) / 20) * 100)
}

function classifyPersona(scores) {
  const { openness, conscientiousness, extraversion, neuroticism, agreeableness } = scores

  // Risk score: High neuroticism + low conscientiousness + high extraversion = higher risk
  const riskScore = Math.round(
    (neuroticism * 0.35) +
    ((100 - conscientiousness) * 0.30) +
    (extraversion * 0.15) +
    ((100 - agreeableness) * 0.10) +
    (openness * 0.10)
  )

  let persona
  if (riskScore >= 70) {
    persona = 'Aggressive'
  } else if (riskScore >= 55) {
    persona = 'Impulsive'
  } else if (neuroticism > 65 && conscientiousness < 45) {
    persona = 'Distracted'
  } else if (riskScore >= 40) {
    persona = 'Balanced'
  } else {
    persona = 'Cautious'
  }

  return { riskScore, persona }
}

export function calculateProfile(answers) {
  const scores = {}

  for (const dim of DIMENSION_MAP) {
    scores[dim.name] = scoreDimension(answers, dim)
  }

  const { riskScore, persona } = classifyPersona(scores)

  return {
    openness: scores.openness,
    conscientiousness: scores.conscientiousness,
    extraversion: scores.extraversion,
    agreeableness: scores.agreeableness,
    neuroticism: scores.neuroticism,
    riskScore,
    persona,
    traits: {
      openness: { score: scores.openness, label: scores.openness > 60 ? 'High' : scores.openness > 40 ? 'Moderate' : 'Low' },
      conscientiousness: { score: scores.conscientiousness, label: scores.conscientiousness > 60 ? 'High' : scores.conscientiousness > 40 ? 'Moderate' : 'Low' },
      extraversion: { score: scores.extraversion, label: scores.extraversion > 60 ? 'High' : scores.extraversion > 40 ? 'Moderate' : 'Low' },
      agreeableness: { score: scores.agreeableness, label: scores.agreeableness > 60 ? 'High' : scores.agreeableness > 40 ? 'Moderate' : 'Low' },
      neuroticism: { score: scores.neuroticism, label: scores.neuroticism > 60 ? 'High' : scores.neuroticism > 40 ? 'Moderate' : 'Low' },
    },
  }
}
