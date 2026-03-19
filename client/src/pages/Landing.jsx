import { Link } from 'react-router-dom'
import ParticleBackground from '../components/ParticleBackground'
import './Landing.css'

const FEATURES = [
  {
    icon: '🧠',
    title: 'Psychometric Profiling',
    description: 'Big Five personality assessment mapped to driving behavior risk profiles using Schwartz Value Theory.',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
  },
  {
    icon: '📷',
    title: 'Live Vehicle Tracking',
    description: 'Real-time camera feed with AI-powered vehicle detection and number plate recognition.',
    gradient: 'linear-gradient(135deg, #00cec9, #81ecec)',
  },
  {
    icon: '🤖',
    title: 'YOLOv8 AI Engine',
    description: 'State-of-the-art computer vision model analyzing dashcam footage for hazard detection.',
    gradient: 'linear-gradient(135deg, #fd79a8, #fab1a0)',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Personalized insights correlating personality traits with detection performance metrics.',
    gradient: 'linear-gradient(135deg, #fdcb6e, #ffeaa7)',
  },
]

const STATS = [
  { value: '< 50ms', label: 'Detection Latency' },
  { value: '95%+', label: 'Model Accuracy' },
  { value: 'Real-time', label: 'Video Processing' },
  { value: '5 Traits', label: 'Big Five Analysis' },
]

export default function Landing() {
  return (
    <div className="landing">
      <ParticleBackground />

      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__badge animate-fade-in-up">
            <span className="badge">AI-Powered Traffic Safety</span>
          </div>
          <h1 className="hero__title animate-fade-in-up delay-1">
            Where <span className="text-gradient">Neuroscience</span> Meets<br />
            Traffic Intelligence
          </h1>
          <p className="hero__subtitle animate-fade-in-up delay-2">
            NeuroTract AI combines psychometric profiling with real-time computer vision
            to create a comprehensive traffic safety intelligence platform.
          </p>
          <div className="hero__actions animate-fade-in-up delay-3">
            <Link to="/questionnaire" className="btn btn-primary btn-lg">
              Start Profiling →
            </Link>
            <Link to="/tracker" className="btn btn-secondary btn-lg">
              Live Tracker
            </Link>
          </div>
        </div>

        {/* Glow orbs */}
        <div className="hero__orb hero__orb--1"></div>
        <div className="hero__orb hero__orb--2"></div>
        <div className="hero__orb hero__orb--3"></div>
      </section>

      {/* Stats bar */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__grid">
            {STATS.map((stat, i) => (
              <div key={i} className={`stats-bar__item animate-fade-in-up delay-${i + 1}`}>
                <span className="stats-bar__value">{stat.value}</span>
                <span className="stats-bar__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features section">
        <div className="container">
          <h2 className="features__heading animate-fade-in-up">
            Platform <span className="text-gradient">Capabilities</span>
          </h2>
          <p className="features__subtitle animate-fade-in-up delay-1">
            A unified system bridging psychology, AI, and real-time analytics.
          </p>
          <div className="features__grid">
            {FEATURES.map((feat, i) => (
              <div key={i} className={`feature-card glass-card animate-fade-in-up delay-${i + 1}`}>
                <div className="feature-card__icon" style={{ background: feat.gradient }}>
                  {feat.icon}
                </div>
                <h3 className="feature-card__title">{feat.title}</h3>
                <p className="feature-card__desc">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta section">
        <div className="container">
          <div className="cta__card glass-card">
            <h2 className="cta__title animate-fade-in-up">
              Ready to Begin Your <span className="text-gradient">Risk Assessment</span>?
            </h2>
            <p className="cta__text animate-fade-in-up delay-1">
              Take the psychometric questionnaire to discover your driving persona and understand how your personality affects hazard perception.
            </p>
            <Link to="/questionnaire" className="btn btn-primary btn-lg animate-fade-in-up delay-2">
              Launch Profiler →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__brand">◆ NeuroTract AI</span>
          <span className="footer__copy">© 2026 — AI-Powered Traffic Safety Intelligence</span>
        </div>
      </footer>
    </div>
  )
}
