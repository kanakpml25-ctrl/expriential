import React, { useState } from 'react';
import { Quiz, Question, QuestionOption, QuestionType, DifficultyLevel } from '../types/quiz';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  CheckCircle2,
  Database,
  Code
} from 'lucide-react';

interface QuizEditorProps {
  initialQuiz?: Quiz | null;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
  onOpenQuestionBankPicker: (onSelectQuestions: (questions: Question[]) => void) => void;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  initialQuiz,
  onSave,
  onCancel,
  onOpenQuestionBankPicker,
}) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [courseCode, setCourseCode] = useState(initialQuiz?.courseCode || '');
  const [category, setCategory] = useState(initialQuiz?.category || 'Computer Science');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(initialQuiz?.durationMinutes || 15);
  const [passingPercentage, setPassingPercentage] = useState(initialQuiz?.passingPercentage || 60);
  const [negativeMarking, setNegativeMarking] = useState(initialQuiz?.negativeMarking ?? 0.25);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialQuiz?.difficulty || 'Intermediate');
  const [instructorName, setInstructorName] = useState(initialQuiz?.instructorName || 'Dept of CSE');
  const [isPublished, setIsPublished] = useState(initialQuiz?.isPublished ?? true);
  const [shuffleQuestions, setShuffleQuestions] = useState(initialQuiz?.shuffleQuestions ?? false);

  const [questions, setQuestions] = useState<Question[]>(
    initialQuiz?.questions || [
      {
        id: `q-${Date.now()}-1`,
        text: 'What is the primary objective of this topic?',
        type: 'single',
        options: [
          { id: 'opt-1', text: 'Option A' },
          { id: 'opt-2', text: 'Option B' },
          { id: 'opt-3', text: 'Option C' },
          { id: 'opt-4', text: 'Option D' },
        ],
        correctOptionIds: ['opt-1'],
        explanation: 'Brief academic explanation of why this option is correct.',
        category: 'General',
        difficulty: 'Beginner',
        points: 4,
      },
    ]
  );

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Add a blank new question
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      text: '',
      type: 'single',
      options: [
        { id: `opt-${Date.now()}-1`, text: '' },
        { id: `opt-${Date.now()}-2`, text: '' },
        { id: `opt-${Date.now()}-3`, text: '' },
        { id: `opt-${Date.now()}-4`, text: '' },
      ],
      correctOptionIds: [],
      explanation: '',
      category: category || 'General',
      difficulty: 'Intermediate',
      points: 4,
    };
    setQuestions([...questions, newQ]);
    setActiveQuestionIndex(questions.length);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setActiveQuestionIndex(Math.max(0, index - 1));
  };

  // Update field of current question
  const updateActiveQuestion = (fields: Partial<Question>) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[activeQuestionIndex] = { ...copy[activeQuestionIndex], ...fields };
      return copy;
    });
  };

  // Option management for active question
  const handleOptionTextChange = (optIndex: number, text: string) => {
    const cur = questions[activeQuestionIndex];
    const newOptions = [...cur.options];
    newOptions[optIndex] = { ...newOptions[optIndex], text };
    updateActiveQuestion({ options: newOptions });
  };

  const handleToggleCorrectOption = (optId: string) => {
    const cur = questions[activeQuestionIndex];
    if (cur.type === 'single' || cur.type === 'boolean') {
      updateActiveQuestion({ correctOptionIds: [optId] });
    } else {
      const current = cur.correctOptionIds || [];
      const updated = current.includes(optId)
        ? current.filter((id) => id !== optId)
        : [...current, optId];
      updateActiveQuestion({ correctOptionIds: updated });
    }
  };

  const handleAddOption = () => {
    const cur = questions[activeQuestionIndex];
    const newOpt: QuestionOption = {
      id: `opt-${Date.now()}-${cur.options.length + 1}`,
      text: '',
    };
    updateActiveQuestion({ options: [...cur.options, newOpt] });
  };

  const handleRemoveOption = (optIndex: number) => {
    const cur = questions[activeQuestionIndex];
    if (cur.options.length <= 2) {
      alert('Questions must have at least 2 options.');
      return;
    }
    const removedOptId = cur.options[optIndex].id;
    const newOptions = cur.options.filter((_, i) => i !== optIndex);
    const newCorrect = cur.correctOptionIds.filter((id) => id !== removedOptId);
    updateActiveQuestion({ options: newOptions, correctOptionIds: newCorrect });
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    const cur = questions[activeQuestionIndex];
    if (type === 'boolean') {
      const boolOptions = [
        { id: `opt-true-${Date.now()}`, text: 'True' },
        { id: `opt-false-${Date.now()}`, text: 'False' },
      ];
      updateActiveQuestion({
        type: 'boolean',
        options: boolOptions,
        correctOptionIds: [boolOptions[0].id],
      });
    } else if (type === 'single') {
      updateActiveQuestion({
        type: 'single',
        correctOptionIds: cur.correctOptionIds.slice(0, 1),
      });
    } else {
      updateActiveQuestion({ type: 'multiple' });
    }
  };

  // Add questions picked from repository
  const handlePickFromQuestionBank = () => {
    onOpenQuestionBankPicker((selected) => {
      if (selected.length > 0) {
        setQuestions((prev) => [...prev, ...selected]);
      }
    });
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    // Validate that each question has valid content and at least one correct option
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1} text cannot be empty.`);
        setActiveQuestionIndex(i);
        return;
      }
      if (q.correctOptionIds.length === 0) {
        alert(`Question ${i + 1} must have at least one correct answer marked.`);
        setActiveQuestionIndex(i);
        return;
      }
    }

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 4), 0);

    const savedQuiz: Quiz = {
      id: initialQuiz?.id || `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      courseCode: courseCode.trim() || 'GEN101',
      category: category.trim() || 'General',
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 15,
      totalPoints,
      passingPercentage: Number(passingPercentage) || 60,
      negativeMarking: Number(negativeMarking) || 0,
      difficulty,
      isPublished,
      shuffleQuestions,
      instructorName: instructorName.trim() || 'Department Faculty',
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
      questions,
    };

    onSave(savedQuiz);
  };

  const activeQ = questions[activeQuestionIndex];

  return (
    <form onSubmit={handleSaveQuiz} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialQuiz ? 'Edit Quiz Assessment' : 'Author New Assessment'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure parameters, grading thresholds, and author questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Assessment</span>
          </button>
        </div>
      </div>

      {/* Basic Settings Card */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          General Assessment Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures & Algorithmic Complexity"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              Course Code *
            </label>
            <input
              type="text"
              required
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS301"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              Subject / Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Computer Science, AI, Databases"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              Instructor / Department
            </label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              placeholder="e.g. Dr. V. Sharma (Dept of CSE)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              Difficulty Tier
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            Description & Instructions
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context and syllabus modules covered in this test..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Numeric Rules Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400">Duration (Minutes)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400">Passing Threshold (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={passingPercentage}
              onChange={(e) => setPassingPercentage(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400">Negative Mark per Error</label>
            <select
              value={negativeMarking}
              onChange={(e) => setNegativeMarking(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs"
            >
              <option value={0}>0 (No Penalty)</option>
              <option value={0.25}>-0.25 Marks</option>
              <option value={0.5}>-0.5 Marks</option>
              <option value={1}>-1.0 Mark</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Shuffle Order</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Publish</span>
            </label>
          </div>
        </div>
      </div>

      {/* Question Authoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigator (Question tabs) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Questions ({questions.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePickFromQuestionBank}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                title="Add from Repository"
              >
                <Database className="w-3 h-3 text-blue-500" />
                <span>Bank</span>
              </button>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => setActiveQuestionIndex(idx)}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  activeQuestionIndex === idx
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-white font-medium shadow-xs'
                    : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    Q{idx + 1}.
                  </span>
                  <span className="truncate">
                    {q.text.trim() || '(Untitled Question)'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-mono text-[10px] text-slate-400">
                    {q.points}pt
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(idx);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Question Editor */}
        {activeQ && (
          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Editing Question {activeQuestionIndex + 1}
              </span>

              <div className="flex items-center gap-3">
                {/* Points */}
                <div className="flex items-center gap-1.5 text-xs">
                  <label className="text-slate-500">Points:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={activeQ.points}
                    onChange={(e) =>
                      updateActiveQuestion({ points: Number(e.target.value) || 1 })
                    }
                    className="w-16 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-xs"
                  />
                </div>

                {/* Question Type */}
                <select
                  value={activeQ.type}
                  onChange={(e) =>
                    handleQuestionTypeChange(e.target.value as QuestionType)
                  }
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="single">Single Choice (MCQ)</option>
                  <option value="multiple">Multiple Correct</option>
                  <option value="boolean">True / False</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Question Statement *
              </label>
              <textarea
                rows={3}
                required
                value={activeQ.text}
                onChange={(e) => updateActiveQuestion({ text: e.target.value })}
                placeholder="Enter question text here..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Code Snippet input (optional) */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-blue-500" />
                  <span>Code Snippet (Optional)</span>
                </label>
                {activeQ.codeSnippet && (
                  <button
                    type="button"
                    onClick={() => updateActiveQuestion({ codeSnippet: undefined })}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Remove Code
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={activeQ.codeSnippet || ''}
                onChange={(e) => updateActiveQuestion({ codeSnippet: e.target.value })}
                placeholder="public static void main(String[] args) { ... }"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Options list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Answer Options (Select checkbox to designate correct answer)
                </label>
                {activeQ.type !== 'boolean' && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {activeQ.options.map((opt, optIdx) => {
                  const isChecked = activeQ.correctOptionIds.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                        isChecked
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCorrectOption(opt.id)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 text-transparent'
                        }`}
                        title="Mark as correct answer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        className="flex-1 bg-transparent border-0 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />

                      {activeQ.type !== 'boolean' && activeQ.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(optIdx)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Option"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-1.5 text-xs pt-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Answer Explanation & Learning Reference
              </label>
              <textarea
                rows={2}
                value={activeQ.explanation}
                onChange={(e) => updateActiveQuestion({ explanation: e.target.value })}
                placeholder="Explain why the selected option is correct so students learn from results..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
