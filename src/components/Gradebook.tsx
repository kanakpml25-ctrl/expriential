import React, { useState, useMemo } from 'react';
import { QuizSubmission, Quiz } from '../types/quiz';
import {
  Search,
  Download,
  Calendar,
  Eye,
  Trash2
} from 'lucide-react';

interface GradebookProps {
  submissions: QuizSubmission[];
  quizzes: Quiz[];
  onViewScorecard: (submission: QuizSubmission) => void;
  onDeleteSubmission: (subId: string) => void;
  initialQuizFilter?: string;
}

export const Gradebook: React.FC<GradebookProps> = ({
  submissions,
  quizzes,
  onViewScorecard,
  onDeleteSubmission,
  initialQuizFilter = 'All',
}) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(initialQuizFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesQuiz =
        selectedQuizId === 'All' || sub.quizId === selectedQuizId;
      const matchesSearch =
        sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesQuiz && matchesSearch;
    });
  }, [submissions, selectedQuizId, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Submission ID',
      'Student Name',
      'Roll Number',
      'Email',
      'Course Code',
      'Quiz Title',
      'Score',
      'Max Score',
      'Percentage',
      'Status',
      'Time Taken (s)',
      'Correct Answers',
      'Incorrect Answers',
      'Submission Date',
    ];

    const rows = filteredSubmissions.map((s) => [
      s.id,
      `"${s.studentName}"`,
      `"${s.studentRoll}"`,
      `"${s.studentEmail}"`,
      s.courseCode,
      `"${s.quizTitle}"`,
      s.score,
      s.maxScore,
      `${s.percentage}%`,
      s.passed ? 'PASSED' : 'FAILED',
      s.timeTakenSeconds,
      s.correctAnswersCount,
      s.incorrectAnswersCount,
      `"${new Date(s.submittedAt).toISOString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SBJIT_Quiz_Gradebook_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const avgScore =
    filteredSubmissions.length > 0
      ? Math.round(
          filteredSubmissions.reduce((acc, curr) => acc + curr.percentage, 0) /
            filteredSubmissions.length
        )
      : 0;

  const passRate =
    filteredSubmissions.length > 0
      ? Math.round(
          (filteredSubmissions.filter((s) => s.passed).length /
            filteredSubmissions.length) *
            100
        )
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Examination Evaluation & Grade Records
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student Gradebook
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit performance records, evaluate cohort pass thresholds, and export official CSV reports.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Gradebook CSV</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <div className="text-slate-500">Filtered Submissions</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
              {filteredSubmissions.length}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Cohort Average</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
              {avgScore}%
            </div>
          </div>
          <div>
            <div className="text-slate-500">Pass Percentage</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              {passRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Filter by Quiz:</label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Assessments ({submissions.length})</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.courseCode} - {q.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name or roll no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student Name & Roll No</th>
                <th className="px-5 py-3.5 font-semibold">Quiz & Course</th>
                <th className="px-5 py-3.5 font-semibold text-right">Raw Score</th>
                <th className="px-5 py-3.5 font-semibold text-right">Percentage</th>
                <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No submissions recorded matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      <div className="font-semibold">{sub.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {sub.studentRoll} · {sub.studentEmail}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {sub.quizTitle}
                      </div>
                      <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                        {sub.courseCode}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {sub.score} / {sub.maxScore}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {sub.percentage}%
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`font-semibold ${
                          sub.passed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {sub.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(sub.submittedAt).toLocaleDateString()}{' '}
                          {new Date(sub.submittedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewScorecard(sub)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
                          title="View Scorecard"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this submission record?')) {
                              onDeleteSubmission(sub.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
