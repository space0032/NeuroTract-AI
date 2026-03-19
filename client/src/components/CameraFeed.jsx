import { useRef, useEffect, useState, useCallback } from 'react'
import './CameraFeed.css'

// Vehicle-related COCO classes
const VEHICLE_CLASSES = ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'person']

const COLORS = {
  car: '#6c5ce7',
  truck: '#00cec9',
  bus: '#fdcb6e',
  motorcycle: '#fd79a8',
  bicycle: '#00b894',
  person: '#e17055',
}

export default function CameraFeed({ isActive, onDetection, onFpsUpdate, onError }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const modelRef = useRef(null)
  const animFrameRef = useRef(null)
  const fpsCountRef = useRef({ frames: 0, lastTime: performance.now() })
  const [modelStatus, setModelStatus] = useState('idle') // idle, loading, ready, error

  // Load COCO-SSD model
  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current

    setModelStatus('loading')
    try {
      const cocoSsd = await import('@tensorflow-models/coco-ssd')
      await import('@tensorflow/tfjs')
      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
      modelRef.current = model
      setModelStatus('ready')
      return model
    } catch (err) {
      console.error('Model load error:', err)
      setModelStatus('error')
      onError?.('Failed to load AI detection model. Please ensure you have a stable internet connection.')
      return null
    }
  }, [onError])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera error:', err)
      onError?.('Camera access denied. Please allow camera permissions to use the Live Tracker.')
    }
  }, [onError])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    // Clear canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  // Detection loop
  const detectLoop = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const model = modelRef.current

    if (!video || !canvas || !model || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectLoop)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    try {
      const predictions = await model.detect(video)

      // Clear and draw boxes
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const vehicleDetections = predictions.filter(p =>
        VEHICLE_CLASSES.includes(p.class) && p.score > 0.45
      )

      vehicleDetections.forEach(pred => {
        const [x, y, w, h] = pred.bbox
        const color = COLORS[pred.class] || '#6c5ce7'

        // Bounding box
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.strokeRect(x, y, w, h)
        ctx.shadowBlur = 0

        // Label background
        const label = `${pred.class} ${(pred.score * 100).toFixed(0)}%`
        ctx.font = 'bold 14px Inter, sans-serif'
        const textWidth = ctx.measureText(label).width
        ctx.fillStyle = color
        ctx.fillRect(x, y - 24, textWidth + 12, 24)

        // Label text
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x + 6, y - 7)
      })

      // FPS calculation
      fpsCountRef.current.frames++
      const now = performance.now()
      if (now - fpsCountRef.current.lastTime >= 1000) {
        onFpsUpdate?.(fpsCountRef.current.frames)
        fpsCountRef.current.frames = 0
        fpsCountRef.current.lastTime = now
      }

      // Report detections
      if (vehicleDetections.length > 0) {
        onDetection?.(vehicleDetections.map(p => ({
          class: p.class,
          score: p.score,
          bbox: { x: p.bbox[0], y: p.bbox[1], w: p.bbox[2], h: p.bbox[3] },
        })))
      }
    } catch (err) {
      // Detection frame error, skip
    }

    animFrameRef.current = requestAnimationFrame(detectLoop)
  }, [onDetection, onFpsUpdate])

  // Effect: start/stop
  useEffect(() => {
    if (isActive) {
      (async () => {
        await startCamera()
        const model = await loadModel()
        if (model) {
          detectLoop()
        }
      })()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [isActive, startCamera, loadModel, detectLoop, stopCamera])

  return (
    <div className="camera-feed glass-card">
      <div className="camera-feed__viewport">
        <video ref={videoRef} className="camera-feed__video" playsInline muted />
        <canvas ref={canvasRef} className="camera-feed__canvas" />

        {!isActive && (
          <div className="camera-feed__overlay">
            <div className="camera-feed__icon">📷</div>
            <p>Click "Start Camera" to begin tracking</p>
          </div>
        )}

        {isActive && modelStatus === 'loading' && (
          <div className="camera-feed__overlay camera-feed__overlay--loading">
            <div className="spinner"></div>
            <p>Loading AI Detection Model...</p>
            <span className="camera-feed__hint">First load may take 10-20 seconds</span>
          </div>
        )}

        {modelStatus === 'error' && (
          <div className="camera-feed__overlay camera-feed__overlay--error">
            <div className="camera-feed__icon">⚠️</div>
            <p>Model failed to load</p>
          </div>
        )}
      </div>

      <div className="camera-feed__footer">
        <span className="camera-feed__model-badge">
          <span className={`camera-feed__dot ${modelStatus === 'ready' ? 'camera-feed__dot--green' : ''}`}></span>
          COCO-SSD {modelStatus === 'ready' ? 'Active' : modelStatus === 'loading' ? 'Loading...' : 'Idle'}
        </span>
      </div>
    </div>
  )
}
