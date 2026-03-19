import './QuestionCard.css'

const LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']

export default function QuestionCard({ question, value, onChange }) {
  return (
    <div className="question-card glass-card">
      <p className="question-card__text">{question.text}</p>
      <div className="question-card__options">
        {LABELS.map((label, i) => {
          const val = i + 1
          return (
            <button
              key={val}
              className={`likert-btn ${value === val ? 'likert-btn--selected' : ''}`}
              onClick={() => onChange(val)}
            >
              <span className="likert-btn__circle">
                <span className="likert-btn__dot"></span>
              </span>
              <span className="likert-btn__label">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
