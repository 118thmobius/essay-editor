import React from 'react';
import './ScoringDisplay.css';

interface ScoringDisplayProps {
  score?: number;
  maxScore?: number;
  feedback?: string;
}

const ScoringDisplay: React.FC<ScoringDisplayProps> = ({
  score,
  maxScore,
  feedback
}) => {
  if (score === undefined && maxScore === undefined && !feedback) {
    return null;
  }

  return (
    <div className="scoring-display">
      {(score !== undefined || maxScore !== undefined) && (
        <div className="score-info">
          得点: {score ?? '-'}/{maxScore ?? '-'}
        </div>
      )}
      {feedback && (
        <div className="feedback-info">
          <span className="feedback-label">講評:</span>
          <pre className="feedback-text" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, display: 'inline' }}>
            {feedback}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ScoringDisplay;