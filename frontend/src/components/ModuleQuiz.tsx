import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import { getModuleQuiz } from "@/data/quizzes";
import { saveQuizResult, useLearningProgress } from "@/lib/progress";

export default function ModuleQuiz({ moduleId }: { moduleId: string }) {
  const quiz = getModuleQuiz(moduleId);
  const progress = useLearningProgress();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const current = quiz.questions[questionIndex];
  const selected = answers[current.id];
  const finished = questionIndex === quiz.questions.length - 1 && submitted;
  const score = useMemo(() => quiz.questions.filter((question) => answers[question.id] === question.answer).length, [answers, quiz.questions]);
  const revisionTopics = useMemo(() => quiz.questions.filter((question) => answers[question.id] !== question.answer).map((question) => question.revisionTopic), [answers, quiz.questions]);
  const saved = progress.quizResults[moduleId];

  const chooseAnswer = (answer: number) => {
    if (submitted) return;
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: answer }));
  };

  const submitAnswer = () => {
    if (selected === undefined) return;
    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (questionIndex < quiz.questions.length - 1) {
      setQuestionIndex((index) => index + 1);
      setSubmitted(false);
      return;
    }
    saveQuizResult(moduleId, { score, total: quiz.questions.length, completedAt: new Date().toISOString(), revisionTopics });
  };

  const resetQuiz = () => {
    setQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
  };

  if (saved && finished && progress.quizResults[moduleId]) {
    const percentage = Math.round((saved.score / saved.total) * 100);
    return <div className="quiz-results" data-testid="quiz-results"><div className="quiz-result-orbit"><Trophy size={29} /><strong data-testid="quiz-result-score">{saved.score}/{saved.total}</strong><span data-testid="quiz-result-percentage">{percentage}%</span></div><p className="panel-kicker" data-testid="quiz-results-kicker"><span className="kicker-dot green-dot" /> MODULE QUIZ COMPLETE</p><h2 data-testid="quiz-results-title">{percentage >= 70 ? "Strong understanding." : "A useful first attempt."}</h2><p className="panel-copy" data-testid="quiz-results-copy">Your result is stored in this browser and now appears on the Progress dashboard.</p><div className="quiz-summary-grid"><div data-testid="quiz-correct-summary"><CheckCircle2 size={17} /><strong>{saved.score}</strong><span>correct answers</span></div><div data-testid="quiz-incorrect-summary"><XCircle size={17} /><strong>{saved.total - saved.score}</strong><span>incorrect answers</span></div></div><div className="revision-card" data-testid="quiz-revision-card"><span className="eyebrow">CONCEPTS TO REVISE</span>{saved.revisionTopics.length ? saved.revisionTopics.map((topic) => <span key={topic} data-testid={`revision-topic-${topic.toLowerCase().replaceAll(" ", "-")}`}>{topic}</span>) : <p data-testid="revision-perfect-message">No revision flags—excellent work.</p>}</div><button className="secondary-button quiz-retry" onClick={resetQuiz} data-testid="quiz-retry-button"><RotateCcw size={15} /> Try again</button></div>;
  }

  return <div className="quiz-panel" data-testid="quiz-panel"><div className="quiz-heading"><div><p className="panel-kicker" data-testid="quiz-kicker"><span className="kicker-dot amber-dot" /> KNOWLEDGE CHECK</p><h2 data-testid="quiz-title">{quiz.title}</h2><p className="panel-copy" data-testid="quiz-description">{quiz.description}</p></div><div className="quiz-progress" data-testid="quiz-progress"><strong>{questionIndex + 1}</strong><span>/ {quiz.questions.length}</span></div></div><div className="quiz-progress-track"><span style={{ width: `${((questionIndex + 1) / quiz.questions.length) * 100}%` }} /></div><div className="quiz-question" data-testid={`quiz-question-${current.id}`}><span className="question-label">QUESTION {String(questionIndex + 1).padStart(2, "0")}</span><h3 data-testid="quiz-question-prompt">{current.prompt}</h3><div className="quiz-options" role="radiogroup" aria-label="Answer options">{current.options.map((option, index) => { const isSelected = selected === index; const isCorrect = submitted && current.answer === index; const isWrong = submitted && isSelected && current.answer !== index; return <button key={option} className={`${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`} onClick={() => chooseAnswer(index)} disabled={submitted} role="radio" aria-checked={isSelected} data-testid={`quiz-option-${index + 1}`}><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong>{isCorrect && <CheckCircle2 size={17} />}{isWrong && <XCircle size={17} />}</button>; })}</div>{submitted && <div className={`answer-explanation ${selected === current.answer ? "correct" : "incorrect"}`} data-testid="quiz-answer-explanation"><div>{selected === current.answer ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}</div><p><strong>{selected === current.answer ? "Correct." : `Review: ${current.revisionTopic}.`}</strong>{current.explanation}</p></div>}</div><div className="quiz-actions">{!submitted ? <button className="primary-button" disabled={selected === undefined} onClick={submitAnswer} data-testid="quiz-submit-button">Check answer <ChevronRight size={15} /></button> : <button className="primary-button" onClick={nextQuestion} data-testid="quiz-next-button">{questionIndex === quiz.questions.length - 1 ? "Save result" : "Next question"} <ChevronRight size={15} /></button>}</div></div>;
}