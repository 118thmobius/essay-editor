import {useState} from 'react';
import MultipleChoiceQuestion from './components/MultipleChoiceQuestion';
import Section from './components/Section';
import './App.css';

interface Option {
  id: string;
  text: string;
}

interface MultipleChoiceQuestionData {
  type: 'multiple_choice';
  id: string;
  title: string;
  question: string;
  options: Option[];
  selectedAnswer: string | null;
  metadata?: {
    correctAnswer?: string;
    score?: number;
    maxScore?: number;
    feedback?: string;
  };
}

interface EssayQuestionData {
  type: 'essay';
  id: string;
  title: string;
  question?: string;
  content: string;
  maxCharacters: number;
  metadata?: {
    score?: number;
    maxScore?: number;
    feedback?: string;
  };
}

type QuestionData = MultipleChoiceQuestionData | EssayQuestionData;

interface TestSection {
  title: string;
  questions: QuestionData[];
}

function App() {
  const [testTitle, setTestTitle] = useState('総合試験');
  const [sections, setSections] = useState<TestSection[]>([]);
  const [globalGridMode, setGlobalGridMode] = useState(true);
  const [globalCharsPerLine, setGlobalCharsPerLine] = useState(40);
  const [globalSettings, setGlobalSettings] = useState({
    timer: { limit: 0, elapsed: 0 } as { limit?: number; elapsed?: number },
    editable: true,
    editable_structure: true
  });
  const [totalScoring, setTotalScoring] = useState({
    maxPoints: null as number | null,
    points: null as number | null,
    overallComment: ''
  });
  const [submitUrl, setSubmitUrl] = useState('');

  const handleMultipleChoiceAnswer = (questionId: string, answerId: string) => {
    setSections(sections.map(section => ({
      ...section,
      questions: section.questions.map(question => 
        question.id === questionId && question.type === 'multiple_choice'
          ? { ...question, selectedAnswer: answerId }
          : question
      )
    })));
  };

  const handleEssayChange = (questionId: string, content: string, maxChars: number) => {
    setSections(sections.map(section => ({
      ...section,
      questions: section.questions.map(question => 
        question.id === questionId && question.type === 'essay'
          ? { ...question, content, maxCharacters: maxChars }
          : question
      )
    })));
  };

  const normalizeText = (text: string) => {
    const FULL_WIDTH_OFFSET = 0xFEE0;
    const FULL_WIDTH_SYMBOL_START = 0xFF01;
    const FULL_WIDTH_SYMBOL_END = 0xFF5E;
    
    return text
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => 
        String.fromCharCode(char.charCodeAt(0) - FULL_WIDTH_OFFSET)
      )
      .replace(/[！-～]/g, (char) => {
        const code = char.charCodeAt(0);
        if (code >= FULL_WIDTH_SYMBOL_START && code <= FULL_WIDTH_SYMBOL_END) {
          return String.fromCharCode(code - FULL_WIDTH_OFFSET);
        }
        return char;
      });
  };

  const importFromJSON = async () => {
    const confirmed = confirm('既存の問題はすべて削除され、JSONファイルの内容で置き換えられます。\n続行しますか？');
    
    if (!confirmed) return;
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        const text = await file.text();
        let parsed: any;
        
        try {
          parsed = JSON.parse(text);
        } catch (error) {
          alert('JSONファイルの形式が正しくありません');
          return;
        }
        
        if (!parsed?.test) {
          alert('JSONファイルの形式が正しくありません');
          return;
        }
        
        const test = parsed.test;
        
        if (test.title) setTestTitle(test.title);
        
        if (test.globalSettings) {
          setGlobalSettings({
            timer: {
              limit: test.globalSettings.timer?.limit ?? 0,
              elapsed: test.globalSettings.timer?.elapsed ?? 0
            },
            editable: test.globalSettings.editable ?? true,
            editable_structure: test.globalSettings.editable_structure ?? true
          });
        }
        
        setTotalScoring({
          maxPoints: test.metadata?.maxScore ?? null,
          points: test.metadata?.score ?? null,
          overallComment: test.metadata?.feedback ?? ''
        });
        
        if (test.sections?.length) {
          const newSections: TestSection[] = test.sections.map((section: any) => ({
            title: section.title,
            questions: section.questions.map((question: any) => {
              if (question.type === 'multiple_choice') {
                return {
                  type: 'multiple_choice',
                  id: question.id,
                  title: question.title,
                  question: question.question,
                  options: question.options,
                  selectedAnswer: question.selectedAnswer,
                  metadata: question.metadata
                };
              } else if (question.type === 'essay') {
                return {
                  type: 'essay',
                  id: question.id,
                  title: question.title,
                  question: question.question,
                  content: question.content || '',
                  maxCharacters: question.maxCharacters || 400,
                  metadata: question.metadata
                };
              }
              return question;
            })
          }));
          setSections(newSections);
        } else {
          setSections([]);
        }
        
        alert('JSONファイルからデータを復元しました');
      };
      
      input.click();
    } catch (error) {
      console.error('ファイル読み込みエラー:', error);
      alert('ファイルの読み込みに失敗しました');
    }
  };

  const createJSONData = () => ({
    test: {
      title: testTitle,
      globalSettings: {
        timer: {
          limit: globalSettings.timer?.limit ?? 0,
          elapsed: globalSettings.timer?.elapsed ?? 0
        },
        editable: globalSettings.editable,
        editable_structure: globalSettings.editable_structure
      },
      ...(totalScoring.points !== null && {
        metadata: {
          score: totalScoring.points,
          maxScore: totalScoring.maxPoints,
          feedback: totalScoring.overallComment
        }
      }),
      sections: sections.map(section => ({
        title: section.title,
        questions: section.questions.map(question => {
          if (question.type === 'multiple_choice') {
            return {
              type: 'multiple_choice',
              id: question.id,
              title: question.title,
              question: question.question,
              options: question.options,
              selectedAnswer: question.selectedAnswer
            };
          } else if (question.type === 'essay') {
            return {
              type: 'essay',
              id: question.id,
              title: question.title,
              question: question.question,
              content: normalizeText(question.content || ''),
              maxCharacters: question.maxCharacters
            };
          }
          return question;
        })
      }))
    }
  });

  const exportAllToJSON = async () => {
    try {
      const jsonString = JSON.stringify(createJSONData(), null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'essay-output.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ファイルの保存に失敗しました:', err);
      alert('ファイルの保存に失敗しました');
    }
  };

  const submitToURL = async () => {
    if (!submitUrl.trim()) {
      alert('URLを入力してください');
      return;
    }

    try {
        const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createJSONData())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log('Server Response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return;
      }
      
      console.log('Parsed Response Data:', responseData);
      
      const test = responseData?.test || responseData;
      
      if (test && (test.title || test.questions || test.globalSettings)) {
        
        if (test.title) setTestTitle(test.title);
        
        if (test.globalSettings) {
          setGlobalSettings({
            timer: {
              limit: test.globalSettings.timer?.limit ?? 0,
              elapsed: test.globalSettings.timer?.elapsed ?? 0
            },
            editable: test.globalSettings.editable ?? true,
            editable_structure: test.globalSettings.editable_structure ?? true
          });
        }
        
        setTotalScoring({
          maxPoints: test.metadata?.maxScore ?? null,
          points: test.metadata?.score ?? null,
          overallComment: test.metadata?.feedback ?? ''
        });
        
        if (test.sections?.length) {
          const newSections: TestSection[] = test.sections.map((section: any) => ({
            title: section.title,
            questions: section.questions.map((question: any) => {
              if (question.type === 'multiple_choice') {
                return {
                  type: 'multiple_choice',
                  id: question.id,
                  title: question.title,
                  question: question.question,
                  options: question.options,
                  selectedAnswer: question.selectedAnswer,
                  metadata: question.metadata
                };
              } else if (question.type === 'essay') {
                return {
                  type: 'essay',
                  id: question.id,
                  title: question.title,
                  question: question.question,
                  content: question.content || '',
                  maxCharacters: question.maxCharacters || 400,
                  metadata: question.metadata
                };
              }
              return question;
            })
          }));
          setSections(newSections);
        }
        
        alert('サーバーからの応答を受信しました');
      } else {
        console.error('Invalid response format:', responseData);
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信に失敗しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <input 
          type="text" 
          value={testTitle} 
          onChange={(e) => setTestTitle(e.target.value)}
          className="app-title-input"
          placeholder="試験の題名"
          disabled={!globalSettings.editable_structure}
        />
        <div className="header-controls">
          {globalGridMode && (
            <div className="chars-per-line-control">
              <label>1行: </label>
              <select 
                value={globalCharsPerLine} 
                onChange={(e) => setGlobalCharsPerLine(Number(e.target.value))}
                className="chars-input"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={80}>80</option>
              </select>
            </div>
          )}
          <button 
            onClick={() => setGlobalGridMode(!globalGridMode)} 
            className={`grid-btn ${globalGridMode ? 'active' : ''}`}
          >
            {globalGridMode ? '■ 方眼紙OFF' : '□ 方眼紙ON'}
          </button>

          <input
            type="url"
            value={submitUrl}
            onChange={(e) => setSubmitUrl(e.target.value)}
            placeholder="送信先URL"
            className="url-input"
          />
          <button onClick={submitToURL} className="submit-btn">
            → 送信
          </button>
          <button onClick={importFromJSON} className="import-btn">
            ↑ 読み込み
          </button>
          <button onClick={exportAllToJSON} className="export-all-btn">
            ↓ 保存
          </button>
        </div>
      </header>
      <main className="app-main">
        {(totalScoring.maxPoints !== null || totalScoring.points !== null || totalScoring.overallComment) && (
          <div className="total-scoring">
            <div className="total-scoring-content">
              <h3>全体採点</h3>
              {(totalScoring.maxPoints !== null || totalScoring.points !== null) && (
                <div className="total-score">
                  総得点: {totalScoring.points ?? '-'}/{totalScoring.maxPoints ?? '-'}
                </div>
              )}
              {totalScoring.overallComment && (
                <div className="overall-comment">
                  <strong>全体講評:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {totalScoring.overallComment}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        {sections.map((section, sectionIndex) => [
          <h2 key={`section-${sectionIndex}`} className="section-title">{section.title}</h2>,
          ...section.questions.map(question => {
            if (question.type === 'multiple_choice') {
              return (
                <MultipleChoiceQuestion
                  key={question.id}
                  id={question.id}
                  title={question.title}
                  question={question.question}
                  options={question.options}
                  selectedAnswer={question.selectedAnswer}
                  isEditable={globalSettings.editable}
                  onAnswerChange={handleMultipleChoiceAnswer}
                  score={question.metadata?.score}
                  maxScore={question.metadata?.maxScore}
                  feedback={question.metadata?.feedback}
                />
              );
            } else if (question.type === 'essay') {
              return (
                <Section
                  key={question.id}
                  id={question.id}
                  title={question.title}
                  gridMode={globalGridMode}
                  charsPerLine={globalCharsPerLine}
                  initialContent={question.content}
                  initialMaxChars={question.maxCharacters}
                  instruction={question.question}
                  scoring={{
                    maxPoints: question.metadata?.maxScore,
                    points: question.metadata?.score,
                    comment: question.metadata?.feedback
                  }}
                  onDelete={() => {}}
                  onTitleChange={() => {}}
                  onContentChange={(id, content, maxChars) => handleEssayChange(id, content, maxChars)}
                  canDelete={false}
                  isEditable={globalSettings.editable}
                  isTitleEditable={false}
                />
              );
            }
            return null;
          })
        ]).flat()}
      </main>
    </div>
  );
}

export default App;