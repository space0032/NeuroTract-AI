import { useState, useEffect } from 'react'
import { Radar, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import './Dashboard.css'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const PERSONA_COLORS = {
  Aggressive: '#e17055',
  Impulsive: '#fdcb6e',
  Distracted: '#fd79a8',
  Balanced: '#00cec9',
  Cautious: '#00b894',
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [detectionStats, setDetectionStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load profile from localStorage
    const stored = localStorage.getItem('neurotract_profile')
    if (stored) {
      setProfile(JSON.parse(stored))
    }

    // Fetch detection stats
    fetch('/api/detections/stats')
      .then(res => res.json())
      .then(data => setDetectionStats(data))
      .catch(() => setDetectionStats({ total: 0, byClass: [], recent: [] }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="dashboard dashboard--loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="dashboard dashboard--empty">
        <div className="container">
          <div className="glass-card dashboard__empty-card">
            <span style={{ fontSize: '3rem' }}>🧠</span>
            <h2>No Profile Found</h2>
            <p>Complete the psychometric questionnaire first to see your personalized dashboard.</p>
            <a href="/questionnaire" className="btn btn-primary">Take Questionnaire →</a>
          </div>
        </div>
      </div>
    )
  }

  const personaColor = PERSONA_COLORS[profile.persona] || '#6c5ce7'

  const radarData = {
    labels: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    datasets: [{
      label: 'Your Profile',
      data: [profile.openness, profile.conscientiousness, profile.extraversion, profile.agreeableness, profile.neuroticism],
      backgroundColor: 'rgba(108, 92, 231, 0.2)',
      borderColor: 'rgba(108, 92, 231, 0.8)',
      borderWidth: 2,
      pointBackgroundColor: '#6c5ce7',
      pointRadius: 5,
    }],
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, color: 'rgba(220,221,245,0.4)', backdropColor: 'transparent' },
        grid: { color: 'rgba(108,92,231,0.12)' },
        angleLines: { color: 'rgba(108,92,231,0.12)' },
        pointLabels: { color: 'rgba(220,221,245,0.7)', font: { size: 11, family: 'Inter' } },
      },
    },
    plugins: { legend: { display: false } },
  }

  // Detection bar chart
  const barData = detectionStats?.byClass?.length ? {
    labels: detectionStats.byClass.map(d => d.object_class),
    datasets: [{
      label: 'Detections',
      data: detectionStats.byClass.map(d => d.count),
      backgroundColor: detectionStats.byClass.map((d, i) => {
        const colors = ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8', '#00b894', '#e17055']
        return colors[i % colors.length]
      }),
      borderRadius: 6,
      borderSkipped: false,
    }],
  } : null

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: 'rgba(220,221,245,0.5)', font: { family: 'Inter' } }, grid: { display: false } },
      y: { ticks: { color: 'rgba(220,221,245,0.4)' }, grid: { color: 'rgba(108,92,231,0.08)' } },
    },
    plugins: { legend: { display: false } },
  }

  return (
    <div className="dashboard">
      <div className="container container-wide dashboard__inner">
        <div className="dashboard__header animate-fade-in-up">
          <div>
            <span className="badge">Analytics</span>
            <h1 className="dashboard__title">
              Your <span className="text-gradient">Intelligence Report</span>
            </h1>
          </div>
          <div className="dashboard__persona-badge" style={{ borderColor: personaColor }}>
            <span className="dashboard__persona-label">Persona</span>
            <span className="dashboard__persona-value" style={{ color: personaColor }}>{profile.persona}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="dashboard__stats animate-fade-in-up delay-1">
          {[
            { label: 'Risk Score', value: profile.riskScore, unit: '/100', color: personaColor },
            { label: 'Total Detections', value: detectionStats?.total || 0, unit: '', color: '#6c5ce7' },
            { label: 'Vehicle Types', value: detectionStats?.byClass?.length || 0, unit: '', color: '#00cec9' },
            { label: 'Persona', value: profile.persona, unit: '', color: personaColor },
          ].map((stat, i) => (
            <div key={i} className="glass-card dash-stat">
              <span className="dash-stat__label">{stat.label}</span>
              <span className="dash-stat__value" style={{ color: stat.color }}>
                {stat.value}<small>{stat.unit}</small>
              </span>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="dashboard__charts animate-fade-in-up delay-2">
          <div className="glass-card dashboard__chart-card">
            <h3>Big Five Personality Map</h3>
            <div className="dashboard__radar-wrap">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          <div className="glass-card dashboard__chart-card">
            <h3>Detection Distribution</h3>
            {barData ? (
              <div className="dashboard__bar-wrap">
                <Bar data={barData} options={barOptions} />
              </div>
            ) : (
              <div className="dashboard__chart-empty">
                <p>No detection data yet. Use the Live Tracker to record vehicle detections.</p>
              </div>
            )}
          </div>
        </div>

        {/* Trait Breakdown */}
        <div className="dashboard__traits glass-card animate-fade-in-up delay-3">
          <h3>Trait Breakdown</h3>
          <div className="traits-grid">
            {[
              { name: 'Openness', score: profile.openness, desc: 'Willingness to explore new routes and adapt to changing conditions.' },
              { name: 'Conscientiousness', score: profile.conscientiousness, desc: 'Attention to traffic rules, signals, and consistent driving habits.' },
              { name: 'Extraversion', score: profile.extraversion, desc: 'Stimulation-seeking behavior and susceptibility to in-car distractions.' },
              { name: 'Agreeableness', score: profile.agreeableness, desc: 'Cooperative driving, yielding to others, and road rage resistance.' },
              { name: 'Neuroticism', score: profile.neuroticism, desc: 'Anxiety response to hazards and stress-induced driving errors.' },
            ].map((trait) => (
              <div key={trait.name} className="trait-card">
                <div className="trait-card__header">
                  <span className="trait-card__name">{trait.name}</span>
                  <span className="trait-card__score">{trait.score}</span>
                </div>
                <div className="trait-card__bar-track">
                  <div className="trait-card__bar-fill" style={{ width: `${trait.score}%` }}></div>
                </div>
                <p className="trait-card__desc">{trait.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Detections */}
        {detectionStats?.recent?.length > 0 && (
          <div className="dashboard__recent glass-card animate-fade-in-up delay-4">
            <h3>Recent Detections</h3>
            <div className="recent-table-wrap">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Object</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {detectionStats.recent.map((d, i) => (
                    <tr key={i}>
                      <td>{d.detected_at || '—'}</td>
                      <td className="capitalize">{d.object_class}</td>
                      <td>{(d.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
