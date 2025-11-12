import React from 'react';
import ScoringDisplay from './ScoringDisplay';
import './MultipleChoiceQuestion.css';

interface Option {
  id: string;
  text: string;
}

interface MultipleChoiceQuestionProps {
  id: string;
  title: string;
  question: string;
  options: Option[];
  selectedAnswer: string | null;
  isEditable: boolean;
  onAnswerChange: (questionId: string, answerId: string) => void;
  score?: number;
  maxScore?: number;
  feedback?: string;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  id,
  title,
  question,
  options,
  selectedAnswer,
  isEditable,
  onAnswerChange,
  score,
  maxScore,
  feedback
}) => {
  return (
    <div className="multiple-choice-question">
      <h3 className="question-title">{title}</h3>
      <div className="question-text">{question}</div>
      <div className="options">
        {options.map((option) => (
          <label key={option.id} className="option">
            <input
              type="radio"
              name={`question-${id}`}
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={() => onAnswerChange(id, option.id)}
              disabled={!isEditable}
            />
            <span className="option-text">
              {option.id.toUpperCase()}. {option.text}
            </span>
          </label>
        ))}
      </div>
      <ScoringDisplay score={score} maxScore={maxScore} feedback={feedback} />
    </div>
  );
};

export default MultipleChoiceQuestion;