import React, { useRef } from 'react';
import { QuizSubmission, StudentProfile } from '../types/quiz';
import { Award, Printer, X, CheckCircle } from 'lucide-react';

interface CertificateModalProps {
  submission: QuizSubmission;
  studentProfile: StudentProfile;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  submission,
  studentProfile,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const certId = `SBJIT-EXAM-2026-${submission.id.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar (hidden during print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Academic Performance Credential</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Transcript</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Styled for crisp presentation & print) */}
        <div
          ref={printRef}
          className="p-8 md:p-12 bg-white text-slate-900 border-8 border-slate-100 m-2 rounded-xl relative"
        >
          {/* Subtle Watermark or Corner Accents */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-blue-900/40" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-blue-900/40" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-blue-900/40" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-blue-900/40" />

          <div className="text-center space-y-6">
            <div className="space-y-1">
              <div className="text-xs tracking-widest uppercase font-bold text-blue-800">
                {studentProfile.institution}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Autonomous Institute Affiliated to Rashtrasant Tukadoji Maharaj Nagpur University
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 pt-3">
                Certificate of Academic Assessment
              </h1>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold pt-1">
                Department of {studentProfile.department}
              </div>
            </div>

            <div className="w-24 h-0.5 bg-blue-700 mx-auto" />

            <div className="space-y-3 max-w-xl mx-auto text-sm text-slate-700 leading-relaxed">
              <p>
                This official assessment transcript certifies that candidate
              </p>
              <div className="text-xl md:text-2xl font-bold text-slate-950 font-serif">
                {submission.studentName}
              </div>
              <p className="font-mono text-xs text-slate-600">
                Enrollment / Roll No: <strong>{submission.studentRoll}</strong>
              </p>
              <p className="pt-2">
                has successfully appeared for and completed the computerized assessment in:
              </p>
              <div className="text-base font-bold text-blue-900">
                {submission.courseCode} · {submission.quizTitle}
              </div>
              <p>
                securing an aggregate score of{' '}
                <strong className="text-slate-900 font-mono">
                  {submission.score} out of {submission.maxScore}
                </strong>{' '}
                ({submission.percentage}%) with qualification status:{' '}
                <strong
                  className={
                    submission.passed ? 'text-emerald-700' : 'text-rose-700'
                  }
                >
                  {submission.passed ? 'QUALIFIED & PASSED' : 'COMPLETED'}
                </strong>.
              </p>
            </div>

            {/* Transcript Footer Signatures & QR / Verification */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 items-end text-xs text-slate-600">
              <div className="text-left space-y-1">
                <div className="text-[11px] text-slate-400">Date of Examination</div>
                <div className="font-mono text-slate-800 font-medium">
                  {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Authenticity</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  ID: {certId}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic font-bold text-slate-800 text-sm">
                  Controller of Exams
                </div>
                <div className="text-[11px] text-slate-400">Board of Evaluations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close (hidden during print) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
