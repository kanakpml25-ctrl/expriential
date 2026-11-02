import React, { useState, useEffect } from 'react';
import { Quiz, QuizSubmission, Question } from '../types/quiz';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Home,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface QuizResultProps {
  submission: QuizSubmission;
  quiz?: Quiz;
  onRetake: () => void;
  onHome: () => void;
  onOpenCertificate: (sub: QuizSubmission) => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  submission,
  quiz,
  onRetake,
  onHome,
  onOpenCertificate,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (submission.passed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#6366f1'],
      });
    }
  }, [submission.passed]);

  const questions: Question[] = quiz ? quiz.questions : [];

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const filteredQuestions = questions.filter((q) => {
    const selected = submission.answers[q.id] || [];
    const isUnanswered = selected.length === 0;
    const isCorrect =
      !isUnanswered &&
      selected.length === q.correctOptionIds.length &&
      selected.every((id) => q.correctOptionIds.includes(id));

    if (filterType === 'correct') return isCorrect;
    if (filterType === 'incorrect') return !isCorrect && !isUnanswered;
    if (filterType === 'unanswered') return isUnanswered;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder}s`;
  };

  const avgSpeed =
    questions.length > 0
      ? Math.round(submission.timeTakenSeconds / questions.length)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Primary Score Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {submission.courseCode} · Official Examination Result
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {submission.quizTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Candidate: <span className="font-semibold text-slate-800 dark:text-slate-200">{submission.studentName}</span> ({submission.studentRoll})
              <span className="mx-2">·</span>
              Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
              {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Grade Badge */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
            <div className="text-right">
              <div
                className={`text-sm font-bold tracking-wider uppercase ${
                  submission.passed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {submission.passed ? 'QUALIFIED / PASSED' : 'NOT QUALIFIED'}
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {submission.score} <span className="text-sm font-normal text-slate-400">/ {submission.maxScore}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {submission.percentage}% Score
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Correct Answers</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {submission.correctAnswersCount} / {submission.totalQuestions}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Incorrect Answers</div>
            <div className="text-lg font-bold font-mono text-rose-500 mt-1">
              {submission.incorrectAnswersCount}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Time Taken</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatSeconds(submission.timeTakenSeconds)}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="text-slate-500 dark:text-slate-400">Avg Speed</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
              {avgSpeed}s / question
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onHome}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </button>
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>

          <button
            onClick={() => onOpenCertificate(submission)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Academic Certificate</span>
          </button>
        </div>
      </div>

      {/* Question Analysis Section */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Item-by-Item Review & Explanations
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilterType('correct')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'correct'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Correct ({submission.correctAnswersCount})
              </button>
              <button
                onClick={() => setFilterType('incorrect')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'incorrect'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Incorrect ({submission.incorrectAnswersCount})
              </button>
              <button
                onClick={() => setFilterType('unanswered')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'unanswered'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Skipped ({submission.unansweredCount})
              </button>
            </div>
          </div>

          {/* List of questions */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => {
              const selectedOptionIds = submission.answers[q.id] || [];
              const isUnanswered = selectedOptionIds.length === 0;
              const isCorrect =
                !isUnanswered &&
                selectedOptionIds.length === q.correctOptionIds.length &&
                selectedOptionIds.every((id) => q.correctOptionIds.includes(id));

              const isExpanded = expandedQuestions[q.id] ?? true;

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-all"
                >
                  {/* Header click to collapse/expand */}
                  <div
                    onClick={() => toggleExpand(q.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : isUnanswered ? (
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Question {idx + 1} · {q.points} Points
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                          {q.text}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          isCorrect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isUnanswered
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? 'Correct' : isUnanswered ? 'Skipped' : 'Incorrect'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">
                        {q.text}
                      </p>

                      {q.codeSnippet && (
                        <div className="rounded-lg bg-slate-900 text-slate-200 p-3 font-mono text-xs overflow-x-auto">
                          <pre>{q.codeSnippet}</pre>
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt) => {
                          const wasSelected = selectedOptionIds.includes(opt.id);
                          const isKeyCorrect = q.correctOptionIds.includes(opt.id);

                          let optionClass =
                            'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300';

                          if (isKeyCorrect) {
                            optionClass =
                              'border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200';
                          } else if (wasSelected && !isKeyCorrect) {
                            optionClass =
                              'border-rose-300 dark:border-rose-700/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`flex items-center justify-between p-3 rounded-lg border text-xs ${optionClass}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{opt.text}</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                                {isKeyCorrect && (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    [Correct Answer]
                                  </span>
                                )}
                                {wasSelected && (
                                  <span
                                    className={`font-semibold ${
                                      isKeyCorrect
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    [Your Choice]
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pedagogical Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="font-semibold text-slate-900 dark:text-white mb-1">
                            Academic Explanation:
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
