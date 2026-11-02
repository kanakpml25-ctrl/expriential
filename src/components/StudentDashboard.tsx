import React, { useState, useMemo } from 'react';
import { Quiz, QuizSubmission, StudentProfile } from '../types/quiz';
import { Clock, HelpCircle, Award, CheckCircle2, Search, ArrowRight, RotateCcw } from 'lucide-react';

interface StudentDashboardProps {
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  studentProfile: StudentProfile;
  onStartQuiz: (quiz: Quiz) => void;
  onViewResult: (submission: QuizSubmission) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  quizzes,
  submissions,
  studentProfile,
  onStartQuiz,
  onViewResult,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(quizzes.map((q) => q.category)));
    return ['All', ...cats];
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (!quiz.isPublished) return false;
      const matchesCategory =
        selectedCategory === 'All' || quiz.category === selectedCategory;
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [quizzes, selectedCategory, searchQuery]);

  const studentSubmissions = useMemo(() => {
    return submissions.filter(
      (s) => s.studentRoll.toLowerCase() === studentProfile.rollNumber.toLowerCase()
    );
  }, [submissions, studentProfile]);

  const stats = useMemo(() => {
    const completedCount = studentSubmissions.length;
    const avgScore =
      completedCount > 0
        ? Math.round(
            studentSubmissions.reduce((acc, curr) => acc + curr.percentage, 0) /
              completedCount
          )
        : 0;
    const passedCount = studentSubmissions.filter((s) => s.passed).length;
    return { completedCount, avgScore, passedCount };
  }, [studentSubmissions]);

  // Map quizId to latest submission if any
  const latestSubmissionByQuiz = useMemo(() => {
    const map = new Map<string, QuizSubmission>();
    for (const sub of studentSubmissions) {
      if (!map.has(sub.quizId)) {
        map.set(sub.quizId, sub);
      }
    }
    return map;
  }, [studentSubmissions]);

  return (
    <div className="space-y-8 pb-12">
      {/* Institutional Header Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {studentProfile.institution}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome, {studentProfile.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Department of {studentProfile.department} · Student ID:{' '}
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {studentProfile.rollNumber}
              </span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Attempted</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {stats.completedCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Passed</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {stats.passedCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Avg. Score</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {stats.avgScore}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Available Quizzes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Available Assessments ({filteredQuizzes.length})
          </h2>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-900 dark:text-white">
              No matching assessments found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or selecting a different subject filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const previousAttempt = latestSubmissionByQuiz.get(quiz.id);

              return (
                <div
                  key={quiz.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Clean unboxed metadata kicker */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {quiz.courseCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{quiz.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{quiz.difficulty}</span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                      {quiz.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {quiz.description}
                    </p>

                    {/* Quiz Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{quiz.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{quiz.questions.length} Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pass: {quiz.passingPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Neg:</span>
                        <span>{quiz.negativeMarking > 0 ? `-${quiz.negativeMarking}` : 'None'}</span>
                      </div>
                    </div>

                    {/* Previous Result Notice if submitted */}
                    {previousAttempt && (
                      <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              previousAttempt.passed ? 'text-emerald-500' : 'text-amber-500'
                            }`}
                          />
                          <span className="text-slate-600 dark:text-slate-300">
                            Last Score:
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {previousAttempt.score}/{previousAttempt.maxScore} (
                          {previousAttempt.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    {previousAttempt ? (
                      <>
                        <button
                          onClick={() => onViewResult(previousAttempt)}
                          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors"
                        >
                          View Scorecard
                        </button>
                        <button
                          onClick={() => onStartQuiz(quiz)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Re-attempt</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onStartQuiz(quiz)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                      >
                        <span>Start Assessment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Previous Assessment Submissions */}
      {studentSubmissions.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Your Assessment Records
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Course & Quiz</th>
                    <th className="px-5 py-3 font-semibold text-right">Score</th>
                    <th className="px-5 py-3 font-semibold text-right">Percentage</th>
                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                    <th className="px-5 py-3 font-semibold">Date Completed</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {studentSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                        <div className="font-semibold">{sub.quizTitle}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sub.courseCode}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono tabular-nums text-right text-slate-700 dark:text-slate-300">
                        {sub.score} / {sub.maxScore}
                      </td>
                      <td className="px-5 py-3 font-mono tabular-nums text-right font-medium text-slate-900 dark:text-white">
                        {sub.percentage}%
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`font-medium ${
                            sub.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {sub.passed ? 'PASSED' : 'NEEDS RETAKE'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => onViewResult(sub)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2"
                        >
                          Scorecard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
