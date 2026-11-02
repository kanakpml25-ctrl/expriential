/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Quiz, QuizSubmission, Question, StudentProfile } from './types/quiz';
import {
  getStoredQuizzes,
  saveStoredQuizzes,
  getStoredSubmissions,
  saveStoredSubmissions,
  addSubmission,
  getStoredProfile,
  saveStoredProfile,
  getStoredQuestionBank,
  saveStoredQuestionBank,
  resetToDefaultData,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { QuizActive } from './components/QuizActive';
import { QuizResult } from './components/QuizResult';
import { InstructorDashboard } from './components/InstructorDashboard';
import { QuizEditor } from './components/QuizEditor';
import { Gradebook } from './components/Gradebook';
import { QuestionBankModal } from './components/QuestionBankModal';
import { CertificateModal } from './components/CertificateModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(getStoredProfile());

  const [currentView, setCurrentView] = useState<
    'student' | 'instructor' | 'gradebook' | 'question-bank' | 'active-quiz' | 'quiz-result' | 'quiz-editor'
  >('student');

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentResultSubmission, setCurrentResultSubmission] = useState<QuizSubmission | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [gradebookQuizFilter, setGradebookQuizFilter] = useState<string>('All');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [certificateSubmission, setCertificateSubmission] = useState<QuizSubmission | null>(null);
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);
  const [bankPickerCallback, setBankPickerCallback] = useState<((selected: Question[]) => void) | null>(null);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('quizmaster_theme') === 'dark' ||
      (!('quizmaster_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('quizmaster_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('quizmaster_theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial data
  useEffect(() => {
    setQuizzes(getStoredQuizzes());
    setSubmissions(getStoredSubmissions());
    setQuestionBank(getStoredQuestionBank());
    setStudentProfile(getStoredProfile());
  }, []);

  // Handlers for quizzes
  const handleSaveQuiz = (savedQuiz: Quiz) => {
    const exists = quizzes.some((q) => q.id === savedQuiz.id);
    let updated: Quiz[];
    if (exists) {
      updated = quizzes.map((q) => (q.id === savedQuiz.id ? savedQuiz : q));
    } else {
      updated = [savedQuiz, ...quizzes];
    }
    setQuizzes(updated);
    saveStoredQuizzes(updated);

    // Also sync questions into question bank
    const existingQIds = new Set(questionBank.map((q) => q.id));
    const newQuestions = savedQuiz.questions.filter((q) => !existingQIds.has(q.id));
    if (newQuestions.length > 0) {
      const updatedBank = [...newQuestions, ...questionBank];
      setQuestionBank(updatedBank);
      saveStoredQuestionBank(updatedBank);
    }

    setEditingQuiz(null);
    setCurrentView('instructor');
  };

  const handleDeleteQuiz = (quizId: string) => {
    const updated = quizzes.filter((q) => q.id !== quizId);
    setQuizzes(updated);
    saveStoredQuizzes(updated);
  };

  const handleDuplicateQuiz = (quiz: Quiz) => {
    const duplicated: Quiz = {
      ...quiz,
      id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${quiz.title} (Copy)`,
      isPublished: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...quizzes];
    setQuizzes(updated);
    saveStoredQuizzes(updated);
  };

  const handleTogglePublish = (quizId: string) => {
    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, isPublished: !q.isPublished } : q
    );
    setQuizzes(updated);
    saveStoredQuizzes(updated);
  };

  // Student Test Flow
  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentView('active-quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmit = (submission: QuizSubmission) => {
    const updated = addSubmission(submission);
    setSubmissions(updated);
    setCurrentResultSubmission(submission);
    setCurrentView('quiz-result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewResult = (submission: QuizSubmission) => {
    const foundQuiz = quizzes.find((q) => q.id === submission.quizId);
    setActiveQuiz(foundQuiz || null);
    setCurrentResultSubmission(submission);
    setCurrentView('quiz-result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeQuiz = () => {
    if (activeQuiz) {
      setCurrentView('active-quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('student');
    }
  };

  // Instructor flows
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setCurrentView('quiz-editor');
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setCurrentView('quiz-editor');
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentView('active-quiz');
  };

  const handleViewGradebookForQuiz = (quizId: string) => {
    setGradebookQuizFilter(quizId);
    setCurrentView('gradebook');
  };

  // Question Bank Picker for Quiz Editor
  const handleOpenQuestionBankPicker = (callback: (selected: Question[]) => void) => {
    setBankPickerCallback(() => callback);
    setIsBankPickerOpen(true);
  };

  const handleDeleteSubmission = (subId: string) => {
    const updated = submissions.filter((s) => s.id !== subId);
    setSubmissions(updated);
    saveStoredSubmissions(updated);
  };

  const handleSaveProfile = (profile: StudentProfile) => {
    setStudentProfile(profile);
    saveStoredProfile(profile);
  };

  const handleResetData = () => {
    resetToDefaultData();
    setQuizzes(getStoredQuizzes());
    setSubmissions(getStoredSubmissions());
    setQuestionBank(getStoredQuestionBank());
    setStudentProfile(getStoredProfile());
    setCurrentView('student');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={
          currentView === 'active-quiz' || currentView === 'quiz-result' || currentView === 'quiz-editor'
            ? 'student'
            : currentView
        }
        onViewChange={(view) => {
          setGradebookQuizFilter('All');
          setCurrentView(view);
        }}
        studentProfile={studentProfile}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        activeQuizTaking={currentView === 'active-quiz'}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentView === 'student' && (
          <StudentDashboard
            quizzes={quizzes}
            submissions={submissions}
            studentProfile={studentProfile}
            onStartQuiz={handleStartQuiz}
            onViewResult={handleViewResult}
          />
        )}

        {currentView === 'active-quiz' && activeQuiz && (
          <QuizActive
            quiz={activeQuiz}
            studentProfile={studentProfile}
            onSubmit={handleQuizSubmit}
            onExit={() => setCurrentView('student')}
          />
        )}

        {currentView === 'quiz-result' && currentResultSubmission && (
          <QuizResult
            submission={currentResultSubmission}
            quiz={activeQuiz || quizzes.find((q) => q.id === currentResultSubmission.quizId)}
            onRetake={handleRetakeQuiz}
            onHome={() => setCurrentView('student')}
            onOpenCertificate={(sub) => setCertificateSubmission(sub)}
          />
        )}

        {currentView === 'instructor' && (
          <InstructorDashboard
            quizzes={quizzes}
            submissions={submissions}
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onDuplicateQuiz={handleDuplicateQuiz}
            onPreviewQuiz={handlePreviewQuiz}
            onTogglePublish={handleTogglePublish}
            onViewGradebookForQuiz={handleViewGradebookForQuiz}
          />
        )}

        {currentView === 'quiz-editor' && (
          <QuizEditor
            initialQuiz={editingQuiz}
            onSave={handleSaveQuiz}
            onCancel={() => setCurrentView('instructor')}
            onOpenQuestionBankPicker={handleOpenQuestionBankPicker}
          />
        )}

        {currentView === 'gradebook' && (
          <Gradebook
            submissions={submissions}
            quizzes={quizzes}
            initialQuizFilter={gradebookQuizFilter}
            onViewScorecard={handleViewResult}
            onDeleteSubmission={handleDeleteSubmission}
          />
        )}

        {currentView === 'question-bank' && (
          <div className="space-y-4">
            <QuestionBankModal
              questionBank={questionBank}
              onUpdateQuestionBank={(updated) => {
                setQuestionBank(updated);
                saveStoredQuestionBank(updated);
              }}
              onClose={() => setCurrentView('instructor')}
            />
          </div>
        )}
      </main>

      {/* Question Bank Picker Modal (when authoring quiz) */}
      {isBankPickerOpen && (
        <QuestionBankModal
          questionBank={questionBank}
          onUpdateQuestionBank={(updated) => {
            setQuestionBank(updated);
            saveStoredQuestionBank(updated);
          }}
          selectionMode={true}
          onSelectQuestions={(selected) => {
            if (bankPickerCallback) {
              bankPickerCallback(selected);
            }
            setIsBankPickerOpen(false);
          }}
          onClose={() => setIsBankPickerOpen(false)}
        />
      )}

      {/* Certificate Modal */}
      {certificateSubmission && (
        <CertificateModal
          submission={certificateSubmission}
          studentProfile={studentProfile}
          onClose={() => setCertificateSubmission(null)}
        />
      )}

      {/* Profile & Reset Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          profile={studentProfile}
          onSave={handleSaveProfile}
          onResetData={handleResetData}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Human-crafted Academic Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">QuizMaster</span>
            <span>·</span>
            <span>Academic Assessment & Examination Portal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>{studentProfile.institution}</span>
            <span>·</span>
            <span>Department of {studentProfile.department}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
