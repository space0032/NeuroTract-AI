import './DetectionLog.css'

const CLASS_COLORS = {
  car: '#6c5ce7',
  truck: '#00cec9',
  bus: '#fdcb6e',
  motorcycle: '#fd79a8',
  bicycle: '#00b894',
  person: '#e17055',
}

export default function DetectionLog({ detections }) {
  if (detections.length === 0) {
    return (
      <div className="detection-log glass-card">
        <h3 className="detection-log__title">Detection Log</h3>
        <div className="detection-log__empty">
          <span className="detection-log__empty-icon">📋</span>
          <p>No detections yet. Start the camera to begin tracking vehicles.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="detection-log glass-card">
      <div className="detection-log__header">
        <h3 className="detection-log__title">Detection Log</h3>
        <span className="badge badge-success">{detections.length} events</span>
      </div>

      <div className="detection-log__list">
        {detections.map((d) => (
          <div key={d.id} className="detection-log__item">
            <span
              className="detection-log__class-dot"
              style={{ background: CLASS_COLORS[d.objectClass] || '#6c5ce7' }}
            ></span>
            <div className="detection-log__info">
              <span className="detection-log__class">{d.objectClass}</span>
              <span className="detection-log__confidence">{d.confidence}%</span>
            </div>
            <span className="detection-log__time">{d.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
