export type QuestionType = 'single' | 'multiple' | 'boolean';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  codeSnippet?: string;
  type: QuestionType;
  options: QuestionOption[];
  correctOptionIds: string[]; // id of correct options
  explanation: string;
  category: string;
  difficulty: DifficultyLevel;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseCode: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalPoints: number;
  passingPercentage: number;
  negativeMarking: number; // e.g. 0.25, 0.5, or 0
  difficulty: DifficultyLevel;
  isPublished: boolean;
  shuffleQuestions: boolean;
  questions: Question[];
  createdAt: string;
  instructorName: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  courseCode: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  totalQuestions: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  submittedAt: string;
  answers: Record<string, string[]>; // questionId -> selectedOptionIds
}

export interface StudentProfile {
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  institution: string;
}
