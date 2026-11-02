import React from 'react';
import { Quiz, QuizSubmission } from '../types/quiz';
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Eye,
  FileCheck,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  BarChart3
} from 'lucide-react';

interface InstructorDashboardProps {
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  onCreateQuiz: () => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  onDuplicateQuiz: (quiz: Quiz) => void;
  onPreviewQuiz: (quiz: Quiz) => void;
  onTogglePublish: (quizId: string) => void;
  onViewGradebookForQuiz: (quizId: string) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  quizzes,
  submissions,
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onDuplicateQuiz,
  onPreviewQuiz,
  onTogglePublish,
  onViewGradebookForQuiz,
}) => {
  // Aggregate Instructor Metrics
  const totalSubmissionsCount = submissions.length;
  const publishedQuizzesCount = quizzes.filter((q) => q.isPublished).length;
  const avgClassScore =
    totalSubmissionsCount > 0
      ? Math.round(
          submissions.reduce((acc, curr) => acc + curr.percentage, 0) /
            totalSubmissionsCount
        )
      : 0;
  const totalQuestionsInQuizzes = quizzes.reduce(
    (sum, q) => sum + q.questions.length,
    0
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Console Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Faculty & Exam Administrator Console
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Assessment Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure course assessments, author questions, monitor student submissions, and publish examination schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onCreateQuiz}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Total Quizzes</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {quizzes.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {publishedQuizzesCount} Active · {quizzes.length - publishedQuizzesCount} Drafts
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Submissions Recorded</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalSubmissionsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across all enrolled batches
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Class Performance</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {avgClassScore}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Mean evaluation benchmark
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Authored Questions</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalQuestionsInQuizzes}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Active test questions
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Management List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Configured Quizzes & Exams ({quizzes.length})
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Course & Quiz Title</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Questions</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Duration</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Pass %</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {quizzes.map((quiz) => {
                  const quizSubmissionsCount = submissions.filter(
                    (s) => s.quizId === quiz.id
                  ).length;

                  return (
                    <tr
                      key={quiz.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {quiz.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {quiz.courseCode}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{quiz.instructorName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {quiz.category}
                      </td>
                      <td className="px-5 py-4 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {quiz.questions.length}
                      </td>
                      <td className="px-5 py-4 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {quiz.durationMinutes}m
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {quiz.passingPercentage}%
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => onTogglePublish(quiz.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            quiz.isPublished
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{quiz.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View submissions */}
                          <button
                            onClick={() => onViewGradebookForQuiz(quiz.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title={`View ${quizSubmissionsCount} submissions`}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>

                          {/* Preview as student */}
                          <button
                            onClick={() => onPreviewQuiz(quiz)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Preview Assessment"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => onDuplicateQuiz(quiz)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Duplicate Quiz"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditQuiz(quiz)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Edit Quiz"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete "${quiz.title}"?`
                                )
                              ) {
                                onDeleteQuiz(quiz.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
