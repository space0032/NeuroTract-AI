import { useState, useRef, useEffect, useCallback } from 'react'
import CameraFeed from '../components/CameraFeed'
import DetectionLog from '../components/DetectionLog'
import './LiveTracker.css'

export default function LiveTracker() {
  const [isActive, setIsActive] = useState(false)
  const [detections, setDetections] = useState([])
  const [stats, setStats] = useState({ total: 0, vehicles: 0, fps: 0 })
  const [error, setError] = useState(null)
  const detectionCountRef = useRef(0)

  const handleDetection = useCallback((newDetections) => {
    if (newDetections.length === 0) return

    const vehicleClasses = ['car', 'truck', 'bus', 'motorcycle', 'bicycle']
    const vehicles = newDetections.filter(d => vehicleClasses.includes(d.class))

    if (vehicles.length > 0) {
      const entries = vehicles.map(v => ({
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        objectClass: v.class,
        confidence: (v.score * 100).toFixed(1),
        plateText: null, // OCR placeholder
        bbox: v.bbox,
      }))

      setDetections(prev => [...entries, ...prev].slice(0, 200))
      detectionCountRef.current += vehicles.length
      setStats(prev => ({ ...prev, total: detectionCountRef.current, vehicles: vehicles.length }))

      // Save to backend (fire and forget)
      entries.forEach(entry => {
        fetch('/api/detections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: localStorage.getItem('neurotract_profile_id'),
            objectClass: entry.objectClass,
            confidence: parseFloat(entry.confidence) / 100,
            plateText: entry.plateText,
            bbox: entry.bbox,
          }),
        }).catch(() => { /* silent fail */ })
      })
    }
  }, [])

  const handleFpsUpdate = useCallback((fps) => {
    setStats(prev => ({ ...prev, fps }))
  }, [])

  return (
    <div className="tracker">
      <div className="container container-wide tracker__inner">
        <div className="tracker__header animate-fade-in-up">
          <div>
            <span className="badge">Live Detection</span>
            <h1 className="tracker__title">
              Vehicle <span className="text-gradient">Tracker</span>
            </h1>
            <p className="tracker__subtitle">
              Real-time vehicle detection using your camera with AI-powered object recognition.
            </p>
          </div>
          <button
            className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { setIsActive(!isActive); setError(null) }}
          >
            {isActive ? '■ Stop Tracking' : '● Start Camera'}
          </button>
        </div>

        {error && (
          <div className="tracker__error glass-card animate-fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Stats bar */}
        <div className="tracker__stats animate-fade-in-up delay-1">
          <div className="stat-pill glass-card">
            <span className="stat-pill__label">Total Detections</span>
            <span className="stat-pill__value">{stats.total}</span>
          </div>
          <div className="stat-pill glass-card">
            <span className="stat-pill__label">Active Vehicles</span>
            <span className="stat-pill__value">{stats.vehicles}</span>
          </div>
          <div className="stat-pill glass-card">
            <span className="stat-pill__label">FPS</span>
            <span className="stat-pill__value">{stats.fps}</span>
          </div>
          <div className="stat-pill glass-card">
            <span className="stat-pill__label">Status</span>
            <span className={`stat-pill__value ${isActive ? 'text-live' : ''}`}>
              {isActive ? '● LIVE' : '○ IDLE'}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="tracker__grid">
          <div className="tracker__feed animate-fade-in-up delay-2">
            <CameraFeed
              isActive={isActive}
              onDetection={handleDetection}
              onFpsUpdate={handleFpsUpdate}
              onError={setError}
            />
          </div>
          <div className="tracker__log animate-fade-in-up delay-3">
            <DetectionLog detections={detections} />
          </div>
        </div>
      </div>
    </div>
  )
}
