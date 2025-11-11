import React from 'react';
import Section from './Section';

interface EssaySection {
  id: string;
  title: string;
  content: string;
  maxCharacters: number;
  metadata?: {
    instruction?: string;
  };
}

interface EssayQuestionProps {
  id: string;
  title: string;
  sections: EssaySection[];
  gridMode: boolean;
  charsPerLine: number;
  isEditable: boolean;
  onSectionContentChange: (questionId: string, sectionId: string, content: string, maxChars: number) => void;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({
  id,
  title,
  sections,
  gridMode,
  charsPerLine,
  isEditable,
  onSectionContentChange
}) => {
  return (
    <div className="essay-question">
      <h3 className="question-title">{title}</h3>
      {sections.map(section => (
        <Section
          key={section.id}
          id={section.id}
          title={section.title}
          gridMode={gridMode}
          charsPerLine={charsPerLine}
          onDelete={() => {}}
          canDelete={false}
          isEditable={isEditable}
          isTitleEditable={false}
          initialContent={section.content}
          initialMaxChars={section.maxCharacters}
          instruction={section.metadata?.instruction}
          onTitleChange={() => {}}
          onContentChange={(sectionId, content, maxChars) => 
            onSectionContentChange(id, sectionId, content, maxChars)
          }
        />
      ))}
    </div>
  );
};

export default EssayQuestion;