import { useState } from 'react'
import QuestionCard from '../components/QuestionCard'
import ProfileReveal from '../components/ProfileReveal'
import './Questionnaire.css'

const QUESTIONS = [
  // Openness (Q0-Q4)
  { id: 0, text: 'I enjoy exploring unfamiliar roads and taking new routes.', dimension: 'Openness' },
  { id: 1, text: 'I prefer sticking to well-known paths rather than trying shortcuts.', dimension: 'Openness', reversed: true },
  { id: 2, text: 'I am curious about how autonomous vehicles work.', dimension: 'Openness' },
  { id: 3, text: 'I feel uncomfortable driving in cities I haven\'t visited before.', dimension: 'Openness', reversed: true },
  { id: 4, text: 'I frequently try new driving techniques or parking methods.', dimension: 'Openness' },

  // Conscientiousness (Q5-Q9)
  { id: 5, text: 'I always check my mirrors before changing lanes.', dimension: 'Conscientiousness' },
  { id: 6, text: 'I sometimes forget to signal before turning.', dimension: 'Conscientiousness', reversed: true },
  { id: 7, text: 'I maintain a consistent following distance from the car ahead.', dimension: 'Conscientiousness' },
  { id: 8, text: 'I tend to rush through yellow traffic lights.', dimension: 'Conscientiousness', reversed: true },
  { id: 9, text: 'I keep my vehicle well-maintained and follow service schedules.', dimension: 'Conscientiousness' },

  // Extraversion (Q10-Q14)
  { id: 10, text: 'I enjoy driving with music at high volume.', dimension: 'Extraversion' },
  { id: 11, text: 'I prefer driving alone in silence to focus on the road.', dimension: 'Extraversion', reversed: true },
  { id: 12, text: 'I frequently engage in conversation while driving.', dimension: 'Extraversion' },
  { id: 13, text: 'I avoid using my phone even at red lights.', dimension: 'Extraversion', reversed: true },
  { id: 14, text: 'Road trips with friends energize me more than solo drives.', dimension: 'Extraversion' },

  // Agreeableness (Q15-Q19)
  { id: 15, text: 'I always yield to pedestrians even when not legally required.', dimension: 'Agreeableness' },
  { id: 16, text: 'I feel frustrated when other drivers cut me off.', dimension: 'Agreeableness', reversed: true },
  { id: 17, text: 'I let other cars merge ahead of me without hesitation.', dimension: 'Agreeableness' },
  { id: 18, text: 'I feel competitive when another driver tries to overtake me.', dimension: 'Agreeableness', reversed: true },
  { id: 19, text: 'I respond calmly to honking from other drivers.', dimension: 'Agreeableness' },

  // Neuroticism (Q20-Q24)
  { id: 20, text: 'I feel anxious driving in heavy rain or fog.', dimension: 'Neuroticism' },
  { id: 21, text: 'I remain calm during unexpected road situations.', dimension: 'Neuroticism', reversed: true },
  { id: 22, text: 'I often worry about getting into an accident.', dimension: 'Neuroticism' },
  { id: 23, text: 'I stay composed when driving on highways at high speeds.', dimension: 'Neuroticism', reversed: true },
  { id: 24, text: 'Aggressive drivers nearby make me very nervous.', dimension: 'Neuroticism' },
]

export default function Questionnaire() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState('next')

  const progress = answers.filter(a => a !== null).length / QUESTIONS.length

  const handleAnswer = (value) => {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = value
    setAnswers(newAnswers)
  }

  const goNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setDirection('next')
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection('prev')
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      // Store profile ID in localStorage for other pages
      localStorage.setItem('neurotract_profile_id', data.id)
      localStorage.setItem('neurotract_profile', JSON.stringify(data))
      setProfile(data)
    } catch (err) {
      console.error('Submit error:', err)
      // Fallback: calculate client-side
      const fallbackProfile = calculateFallbackProfile(answers)
      localStorage.setItem('neurotract_profile', JSON.stringify(fallbackProfile))
      setProfile(fallbackProfile)
    }
    setLoading(false)
  }

  if (profile) {
    return <ProfileReveal profile={profile} />
  }

  const allAnswered = answers.every(a => a !== null)
  const currentQ = QUESTIONS[currentIndex]

  return (
    <div className="questionnaire">
      <div className="container questionnaire__inner">
        <div className="questionnaire__header animate-fade-in-up">
          <span className="badge">Psychometric Assessment</span>
          <h1 className="questionnaire__title">
            Your <span className="text-gradient">Risk Profile</span>
          </h1>
          <p className="questionnaire__subtitle">
            Answer 25 questions based on the Big Five personality model to determine your driving behavior persona.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar animate-fade-in-up delay-1">
          <div className="progress-bar__track">
            <div className="progress-bar__fill" style={{ width: `${progress * 100}%` }}></div>
          </div>
          <span className="progress-bar__label">
            {Math.round(progress * 100)}% Complete — {currentIndex + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Dimension Badge */}
        <div className="questionnaire__dimension animate-fade-in delay-2">
          <span className="badge">{currentQ.dimension}</span>
        </div>

        {/* Question */}
        <div className={`questionnaire__card-container ${direction}`} key={currentIndex}>
          <QuestionCard
            question={currentQ}
            value={answers[currentIndex]}
            onChange={handleAnswer}
          />
        </div>

        {/* Navigation */}
        <div className="questionnaire__nav animate-fade-in-up delay-3">
          <button className="btn btn-secondary" onClick={goPrev} disabled={currentIndex === 0}>
            ← Previous
          </button>

          {currentIndex < QUESTIONS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={goNext}
              disabled={answers[currentIndex] === null}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || loading}
            >
              {loading ? 'Analyzing...' : 'Reveal Profile →'}
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="questionnaire__dots">
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === currentIndex ? 'dot--active' : ''} ${answers[i] !== null ? 'dot--answered' : ''}`}
              onClick={() => { setDirection(i > currentIndex ? 'next' : 'prev'); setCurrentIndex(i) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Client-side fallback scoring (mirrors backend)
function calculateFallbackProfile(answers) {
  const dims = [
    { name: 'openness', start: 0, end: 5, reversed: [1, 3] },
    { name: 'conscientiousness', start: 5, end: 10, reversed: [6, 8] },
    { name: 'extraversion', start: 10, end: 15, reversed: [11, 13] },
    { name: 'agreeableness', start: 15, end: 20, reversed: [16, 18] },
    { name: 'neuroticism', start: 20, end: 25, reversed: [21, 23] },
  ]

  const scores = {}
  for (const dim of dims) {
    let total = 0
    for (let i = dim.start; i < dim.end; i++) {
      const raw = answers[i] || 3
      total += dim.reversed.includes(i) ? (6 - raw) : raw
    }
    scores[dim.name] = Math.round(((total - 5) / 20) * 100)
  }

  const riskScore = Math.round(
    (scores.neuroticism * 0.35) + ((100 - scores.conscientiousness) * 0.30) + (scores.extraversion * 0.15) + ((100 - scores.agreeableness) * 0.10) + (scores.openness * 0.10)
  )

  let persona = 'Balanced'
  if (riskScore >= 70) persona = 'Aggressive'
  else if (riskScore >= 55) persona = 'Impulsive'
  else if (scores.neuroticism > 65 && scores.conscientiousness < 45) persona = 'Distracted'
  else if (riskScore < 40) persona = 'Cautious'

  return { id: 'local-' + Date.now(), ...scores, riskScore, persona }
}
