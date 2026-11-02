import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quiz, QuizSubmission, StudentProfile } from '../types/quiz';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';

interface QuizActiveProps {
  quiz: Quiz;
  studentProfile: StudentProfile;
  onSubmit: (submission: QuizSubmission) => void;
  onExit: () => void;
}

export const QuizActive: React.FC<QuizActiveProps> = ({
  quiz,
  studentProfile,
  onSubmit,
  onExit,
}) => {
  // Prep questions (shuffle if quiz.shuffleQuestions is true)
  const preparedQuestions = useMemo(() => {
    if (!quiz.shuffleQuestions) return quiz.questions;
    return [...quiz.questions].sort(() => Math.random() - 0.5);
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  // Store user answers: { [questionId]: string[] (selectedOptionIds) }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  // Store marked for review question IDs
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  // Visited questions tracking
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(
    new Set([preparedQuestions[0]?.id])
  );
  // Timer in seconds
  const totalDurationSeconds = quiz.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showTabWarningNotice, setShowTabWarningNotice] = useState(false);

  const currentQuestion = preparedQuestions[currentIndex];

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Visibility / Tab switch proctor detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          setShowTabWarningNotice(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Compute final submission object
  const handleFinalSubmit = useCallback(() => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let calculatedScore = 0;

    preparedQuestions.forEach((q) => {
      const selected = selectedAnswers[q.id] || [];
      if (selected.length === 0) {
        unansweredCount++;
        return;
      }

      // Check if selected matches correctOptionIds exactly
      const isCorrect =
        selected.length === q.correctOptionIds.length &&
        selected.every((id) => q.correctOptionIds.includes(id));

      if (isCorrect) {
        correctCount++;
        calculatedScore += q.points;
      } else {
        incorrectCount++;
        if (quiz.negativeMarking > 0) {
          calculatedScore = Math.max(0, calculatedScore - quiz.negativeMarking);
        }
      }
    });

    const timeSpent = totalDurationSeconds - secondsRemaining;
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((calculatedScore / maxScore) * 100);
    const passed = percentage >= quiz.passingPercentage;

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      courseCode: quiz.courseCode,
      studentName: studentProfile.name,
      studentRoll: studentProfile.rollNumber,
      studentEmail: studentProfile.email,
      score: Math.max(0, Number(calculatedScore.toFixed(2))),
      maxScore,
      percentage: Math.max(0, percentage),
      passed,
      timeTakenSeconds: timeSpent,
      totalQuestions: preparedQuestions.length,
      correctAnswersCount: correctCount,
      incorrectAnswersCount: incorrectCount,
      unansweredCount,
      submittedAt: new Date().toISOString(),
      answers: selectedAnswers,
    };

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    onSubmit(submission);
  }, [
    preparedQuestions,
    selectedAnswers,
    quiz,
    totalDurationSeconds,
    secondsRemaining,
    studentProfile,
    onSubmit,
  ]);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleFinalSubmit]);

  // Handle Option Click
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;

    if (currentQuestion.type === 'multiple') {
      const current = selectedAnswers[currentQuestion.id] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];

      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: updated,
      }));
    } else {
      // Single choice or boolean
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: [optionId],
      }));
    }
  };

  const handleClearSelection = () => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  const handleToggleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < preparedQuestions.length) {
      setCurrentIndex(index);
      setVisitedQuestions((prev) => new Set([...prev, preparedQuestions[index].id]));
    }
  };

  // Keyboard navigation & Shortcuts (1-4 for options, arrows for navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if modal is open
      if (isSubmitModalOpen) return;

      if (e.key === 'ArrowRight' && currentIndex < preparedQuestions.length - 1) {
        goToQuestion(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToQuestion(currentIndex - 1);
      } else if (['1', '2', '3', '4'].includes(e.key) && currentQuestion) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (currentQuestion.options[optionIndex]) {
          handleSelectOption(currentQuestion.options[optionIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, preparedQuestions, currentQuestion, isSubmitModalOpen]);

  // Format seconds mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining < 120; // less than 2 mins
  const isCriticalTime = secondsRemaining < 30; // less than 30s

  const answeredCount = Object.keys(selectedAnswers).filter(
    (qid) => selectedAnswers[qid]?.length > 0
  ).length;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Test Control Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>{quiz.courseCode}</span>
              <span aria-hidden="true">·</span>
              <span>{quiz.title}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Candidate: <span className="font-medium text-slate-700 dark:text-slate-200">{studentProfile.name}</span> ({studentProfile.rollNumber})
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold tabular-nums transition-colors ${
                isCriticalTime
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 animate-pulse'
                  : isLowTime
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Final Submit Trigger */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              Finish & Submit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
            style={{
              width: `${(answeredCount / preparedQuestions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Tab Switch Proctor Warning Notice if user changed tab */}
      {showTabWarningNotice && tabSwitchWarnings > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Academic Integrity Warning:</strong> Browser tab switch detected ({tabSwitchWarnings} incident{tabSwitchWarnings > 1 ? 's' : ''}). This activity is logged with your submission.
            </span>
          </div>
          <button
            onClick={() => setShowTabWarningNotice(false)}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Test Workspace (Split Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Area (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            {/* Question Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">
                Question {currentIndex + 1} of {preparedQuestions.length}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  +{currentQuestion.points} Marks
                </span>
                {quiz.negativeMarking > 0 && (
                  <span className="font-mono text-rose-500 font-medium">
                    -{quiz.negativeMarking} Neg
                  </span>
                )}
                <span className="capitalize">{currentQuestion.difficulty}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="mt-5 space-y-4">
              <h2 className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {currentQuestion.text}
              </h2>

              {/* Code Snippet if present */}
              {currentQuestion.codeSnippet && (
                <div className="relative mt-3 rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                  <button
                    onClick={() => copyCode(currentQuestion.codeSnippet!)}
                    className="absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="whitespace-pre">
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Multiple choice note */}
              {currentQuestion.type === 'multiple' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  * Multiple options may be correct. Select all that apply.
                </p>
              )}

              {/* Options List */}
              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = (
                    selectedAnswers[currentQuestion.id] || []
                  ).includes(option.id);

                  const letterLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {letterLabel}
                      </div>
                      <span className="text-sm font-normal leading-snug flex-1">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    markedForReview.has(currentQuestion.id)
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>
                    {markedForReview.has(currentQuestion.id)
                      ? 'Marked for Review'
                      : 'Mark for Review'}
                  </span>
                </button>

                {selectedAnswers[currentQuestion.id]?.length > 0 && (
                  <button
                    onClick={handleClearSelection}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < preparedQuestions.length - 1 ? (
                  <button
                    onClick={() => goToQuestion(currentIndex + 1)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                  >
                    <span>Save & Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                  >
                    <span>Review & Submit</span>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">1-4</kbd> to select option, <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">←</kbd> and <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">→</kbd> to navigate.
          </div>
        </div>

        {/* Right Column: Question Palette & Overview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Question Navigator
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                <span>Review ({markedForReview.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                <span>Answered & Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Palette Grid */}
            <div className="grid grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {preparedQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = (selectedAnswers[q.id] || []).length > 0;
                const isMarked = markedForReview.has(q.id);
                const isVisited = visitedQuestions.has(q.id);

                let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                if (isAnswered && isMarked) {
                  bgClass = 'bg-amber-400 dark:bg-amber-500 text-slate-950 font-bold';
                } else if (isMarked) {
                  bgClass = 'bg-purple-600 text-white font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold';
                } else if (!isVisited) {
                  bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-400';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center transition-all ${bgClass} ${
                      isCurrent
                        ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-slate-900 scale-105 shadow-xs font-bold'
                        : 'hover:opacity-90'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Quick Status Stats */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                  {preparedQuestions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                  {preparedQuestions.length - answeredCount}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before final submit */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm Submission
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to finish this assessment? Once submitted, your answers cannot be altered.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Answered:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {answeredCount} / {preparedQuestions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Unanswered / Skipped:</span>
                <span className="font-mono font-semibold text-rose-500">
                  {preparedQuestions.length - answeredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Marked for Review:</span>
                <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                  {markedForReview.size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Time Remaining:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {formatTime(secondsRemaining)}
                </span>
              </div>
            </div>

            {preparedQuestions.length - answeredCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You have unanswered questions. Unanswered questions will receive 0 marks.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Return to Test
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  handleFinalSubmit();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
