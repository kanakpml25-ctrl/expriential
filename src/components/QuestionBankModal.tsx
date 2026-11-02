import React, { useState, useMemo } from 'react';
import { Question } from '../types/quiz';
import {
  Search,
  Download,
  Upload,
  Plus,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

interface QuestionBankModalProps {
  questionBank: Question[];
  onUpdateQuestionBank: (questions: Question[]) => void;
  onClose: () => void;
  // If in selection mode for a quiz
  selectionMode?: boolean;
  onSelectQuestions?: (selected: Question[]) => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  questionBank,
  onUpdateQuestionBank,
  onClose,
  selectionMode = false,
  onSelectQuestions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const set = new Set(questionBank.map((q) => q.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [questionBank]);

  const filteredQuestions = useMemo(() => {
    return questionBank.filter((q) => {
      const matchesCat =
        selectedCategory === 'All' || q.category === selectedCategory;
      const matchesSearch =
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [questionBank, selectedCategory, searchQuery]);

  const handleToggleSelect = (qId: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const handleConfirmSelection = () => {
    if (!onSelectQuestions) return;
    const selected = questionBank.filter((q) => selectedQuestionIds.has(q.id));
    onSelectQuestions(selected);
    onClose();
  };

  // Export question bank to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questionBank, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `question_bank_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Merge unique by text or ID
          const existingIds = new Set(questionBank.map((q) => q.id));
          const newQuestions = parsed.filter((q: Question) => q.text && !existingIds.has(q.id));
          const merged = [...newQuestions, ...questionBank];
          onUpdateQuestionBank(merged);
          alert(`Successfully imported ${newQuestions.length} new questions into the Question Bank.`);
        } else {
          alert('Invalid file format. Expected a JSON array of questions.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectionMode ? 'Select Questions from Repository' : 'Academic Question Bank'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total {questionBank.length} questions catalogued across curricula.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!selectionMode && (
              <>
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Question List Viewport */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              No questions found matching your filter criteria.
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = selectedQuestionIds.has(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => selectionMode && handleToggleSelect(q.id)}
                  className={`p-4 rounded-xl border text-xs transition-all ${
                    selectionMode ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {q.category || 'General'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{q.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{q.points} Points</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{q.type} choice</span>
                      </div>

                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {q.text}
                      </div>

                      {q.codeSnippet && (
                        <div className="p-2 rounded-md bg-slate-950 text-slate-200 font-mono text-[11px] max-w-lg overflow-x-auto">
                          <pre>{q.codeSnippet}</pre>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-[11px] text-slate-600 dark:text-slate-400">
                        {q.options.map((opt) => {
                          const isCorrect = q.correctOptionIds.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={`px-2 py-1 rounded border ${
                                isCorrect
                                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium'
                                  : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {opt.text} {isCorrect && '✓'}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectionMode && (
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {selectionMode
              ? `${selectedQuestionIds.size} questions selected`
              : `Showing ${filteredQuestions.length} of ${questionBank.length} items`}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Close
            </button>
            {selectionMode && (
              <button
                onClick={handleConfirmSelection}
                disabled={selectedQuestionIds.size === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
              >
                Add {selectedQuestionIds.size} to Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
