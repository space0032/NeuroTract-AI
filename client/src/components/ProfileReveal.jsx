import { useNavigate } from 'react-router-dom'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import './ProfileReveal.css'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const PERSONA_CONFIG = {
  Aggressive: { emoji: '🔥', color: '#e17055', gradient: 'linear-gradient(135deg, #e17055, #d63031)', description: 'You tend toward bold, assertive driving behavior. High sensation-seeking may lead to faster speeds and shorter following distances.' },
  Impulsive: { emoji: '⚡', color: '#fdcb6e', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)', description: 'Quick decision-making but sometimes without full risk assessment. May respond to hazards reactively rather than proactively.' },
  Distracted: { emoji: '💫', color: '#fd79a8', gradient: 'linear-gradient(135deg, #fd79a8, #6c5ce7)', description: 'Tendency toward divided attention while driving. High neuroticism combined with low conscientiousness increases hazard response delays.' },
  Balanced: { emoji: '⚖️', color: '#00cec9', gradient: 'linear-gradient(135deg, #00cec9, #6c5ce7)', description: 'Well-rounded driving style with moderate risk tolerance. Generally good hazard perception but may be inconsistent under stress.' },
  Cautious: { emoji: '🛡️', color: '#00b894', gradient: 'linear-gradient(135deg, #00b894, #00cec9)', description: 'Careful, deliberate driving style with high attention to rules. Excellent hazard anticipation but may over-brake in some situations.' },
}

export default function ProfileReveal({ profile }) {
  const navigate = useNavigate()
  const config = PERSONA_CONFIG[profile.persona] || PERSONA_CONFIG.Balanced

  const radarData = {
    labels: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    datasets: [
      {
        label: 'Your Profile',
        data: [profile.openness, profile.conscientiousness, profile.extraversion, profile.agreeableness, profile.neuroticism],
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        borderColor: 'rgba(108, 92, 231, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(108, 92, 231, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, color: 'rgba(220,221,245,0.4)', backdropColor: 'transparent', font: { size: 10 } },
        grid: { color: 'rgba(108,92,231,0.12)' },
        angleLines: { color: 'rgba(108,92,231,0.12)' },
        pointLabels: { color: 'rgba(220,221,245,0.7)', font: { size: 12, family: 'Inter' } },
      },
    },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  }

  return (
    <div className="profile-reveal">
      <div className="container profile-reveal__inner">
        <div className="profile-reveal__persona animate-fade-in-up">
          <div className="persona-icon" style={{ background: config.gradient }}>
            {config.emoji}
          </div>
          <h1 className="profile-reveal__title">
            You are: <span style={{ color: config.color }}>{profile.persona}</span>
          </h1>
          <p className="profile-reveal__desc">{config.description}</p>
        </div>

        <div className="profile-reveal__grid">
          <div className="profile-reveal__chart glass-card animate-fade-in-up delay-1">
            <h3>Big Five Personality Map</h3>
            <div className="radar-wrapper">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          <div className="profile-reveal__stats animate-fade-in-up delay-2">
            <div className="glass-card risk-card">
              <span className="risk-card__label">Risk Score</span>
              <span className="risk-card__value" style={{ color: config.color }}>{profile.riskScore}</span>
              <span className="risk-card__scale">/100</span>
            </div>

            {[
              { label: 'Openness', value: profile.openness },
              { label: 'Conscientiousness', value: profile.conscientiousness },
              { label: 'Extraversion', value: profile.extraversion },
              { label: 'Agreeableness', value: profile.agreeableness },
              { label: 'Neuroticism', value: profile.neuroticism },
            ].map(({ label, value }) => (
              <div key={label} className="glass-card trait-bar-item">
                <div className="trait-bar-item__header">
                  <span>{label}</span>
                  <span className="trait-bar-item__value">{value}</span>
                </div>
                <div className="trait-bar-item__track">
                  <div
                    className="trait-bar-item__fill"
                    style={{ width: `${value}%`, background: config.gradient }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-reveal__actions animate-fade-in-up delay-3">
          <button className="btn btn-primary" onClick={() => navigate('/tracker')}>
            Launch Live Tracker →
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
