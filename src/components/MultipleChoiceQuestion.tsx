import React from 'react';
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
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  id,
  title,
  question,
  options,
  selectedAnswer,
  isEditable,
  onAnswerChange
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
    </div>
  );
};

export default MultipleChoiceQuestion;