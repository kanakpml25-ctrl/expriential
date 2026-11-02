import { Quiz, QuizSubmission, StudentProfile, Question } from '../types/quiz';
import { initialQuizzes, initialSubmissions, defaultStudentProfile } from '../data/mockQuizzes';

const QUIZZES_STORAGE_KEY = 'quizmaster_quizzes_v2';
const SUBMISSIONS_STORAGE_KEY = 'quizmaster_submissions_v2';
const PROFILE_STORAGE_KEY = 'quizmaster_profile_v2';
const QUESTION_BANK_KEY = 'quizmaster_question_bank_v2';

export const getStoredQuizzes = (): Quiz[] => {
  try {
    const data = localStorage.getItem(QUIZZES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(initialQuizzes));
      return initialQuizzes;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading quizzes from localStorage:', err);
    return initialQuizzes;
  }
};

export const saveStoredQuizzes = (quizzes: Quiz[]): void => {
  try {
    localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
  } catch (err) {
    console.error('Failed saving quizzes:', err);
  }
};

export const getStoredSubmissions = (): QuizSubmission[] => {
  try {
    const data = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(initialSubmissions));
      return initialSubmissions;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading submissions:', err);
    return initialSubmissions;
  }
};

export const saveStoredSubmissions = (submissions: QuizSubmission[]): void => {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.error('Failed saving submissions:', err);
  }
};

export const addSubmission = (submission: QuizSubmission): QuizSubmission[] => {
  const current = getStoredSubmissions();
  const updated = [submission, ...current];
  saveStoredSubmissions(updated);
  return updated;
};

export const getStoredProfile = (): StudentProfile => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultStudentProfile));
      return defaultStudentProfile;
    }
    return JSON.parse(data);
  } catch (err) {
    return defaultStudentProfile;
  }
};

export const saveStoredProfile = (profile: StudentProfile): void => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed saving profile:', err);
  }
};

// Central Question Bank
export const getStoredQuestionBank = (): Question[] => {
  try {
    const data = localStorage.getItem(QUESTION_BANK_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Aggregate questions from initial quizzes as initial question bank
    const aggregated = initialQuizzes.flatMap(q => q.questions);
    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(aggregated));
    return aggregated;
  } catch (err) {
    return initialQuizzes.flatMap(q => q.questions);
  }
};

export const saveStoredQuestionBank = (questions: Question[]): void => {
  try {
    localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed saving question bank:', err);
  }
};

export const resetToDefaultData = (): void => {
  localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(initialQuizzes));
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(initialSubmissions));
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultStudentProfile));
  const aggregated = initialQuizzes.flatMap(q => q.questions);
  localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(aggregated));
};
