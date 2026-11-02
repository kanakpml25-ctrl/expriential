import React from 'react';
import { BookOpen, Moon, Sun, UserCircle } from 'lucide-react';
import { StudentProfile } from '../types/quiz';

interface NavbarProps {
  currentView: 'student' | 'instructor' | 'gradebook' | 'question-bank';
  onViewChange: (view: 'student' | 'instructor' | 'gradebook' | 'question-bank') => void;
  studentProfile: StudentProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  activeQuizTaking?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  studentProfile,
  isDarkMode,
  onToggleDarkMode,
  onOpenProfile,
  activeQuizTaking = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => !activeQuizTaking && onViewChange('student')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
              disabled={activeQuizTaking}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  QuizMaster
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap -mt-0.5">
                  Academic Portal
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (hidden if in live exam for focus) */}
          {!activeQuizTaking ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <button
                onClick={() => onViewChange('student')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
                  currentView === 'student'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : ''
                }`}
              >
                Available Quizzes
              </button>
              <button
                onClick={() => onViewChange('instructor')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
                  currentView === 'instructor'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : ''
                }`}
              >
                Instructor Console
              </button>
              <button
                onClick={() => onViewChange('question-bank')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
                  currentView === 'question-bank'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : ''
                }`}
              >
                Question Bank
              </button>
              <button
                onClick={() => onViewChange('gradebook')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
                  currentView === 'gradebook'
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : ''
                }`}
              >
                Gradebook & Submissions
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-md border border-amber-200 dark:border-amber-800">
              <span>Assessment In Progress · Timed Session</span>
            </div>
          )}

          {/* Zone 3: 1 primary action & utilities */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!activeQuizTaking && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 py-1.5 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <UserCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="max-w-[120px] truncate">{studentProfile.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {studentProfile.rollNumber}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
