
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuizState, QuizAnswers } from '../types';
import { QUIZ_CONFIG, PROGRESS_SECTIONS } from '../constants';

interface QuizContextType {
  state: QuizState;
  handleAnswer: (key: string, value: any) => void;
  nextQuestion: (latestAnswers?: QuizAnswers) => void;
  prevQuestion: () => void;
  getCurrentSection: () => string;
  getQuestionIndex: () => { current: number; total: number };
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuizState>({
    currentStepId: 'gender',
    history: [],
    answers: {},
    isSoftExit: false,
    completed: false,
  });

  const handleAnswer = (key: keyof QuizAnswers, value: any) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [key]: value },
    }));
  };

  const nextQuestion = (latestAnswers?: QuizAnswers) => {
    const currentConfig = QUIZ_CONFIG.find((q) => q.id === state.currentStepId);
    if (!currentConfig || !currentConfig.next) return;

    let nextId: string;
    // Use provided latestAnswers if available, otherwise use state.answers (which might be stale inside atomic updates)
    const answersToCheck = latestAnswers || state.answers;

    if (typeof currentConfig.next === 'function') {
      nextId = currentConfig.next(answersToCheck);
    } else {
      nextId = currentConfig.next;
    }

    if (nextId === 'soft-exit') {
      setState(prev => ({ ...prev, isSoftExit: true }));
      return;
    }

    setState((prev) => ({
      ...prev,
      history: [...prev.history, prev.currentStepId],
      currentStepId: nextId,
    }));
  };

  const prevQuestion = () => {
    if (state.history.length === 0) return;
    const newHistory = [...state.history];
    const prevId = newHistory.pop();

    setState((prev) => ({
      ...prev,
      history: newHistory,
      currentStepId: prevId!,
    }));
  };

  const getCurrentSection = () => {
    const config = QUIZ_CONFIG.find(q => q.id === state.currentStepId);
    return config?.section || '';
  };

  const getQuestionIndex = () => {
    const config = QUIZ_CONFIG.find(q => q.id === state.currentStepId);
    const currentSectionId = config?.section;

    // If no section (info slides, loading, etc.), return 0
    if (!currentSectionId) {
      return { current: 0, total: 0 };
    }

    // Filter questions in the current section only
    const sectionQuestions = QUIZ_CONFIG
      .filter(q => q.section === currentSectionId && q.type !== 'loading')
      .map(q => q.id);

    const currentIdx = sectionQuestions.indexOf(state.currentStepId);

    // If we are on a question that is part of the current section
    if (currentIdx !== -1) {
      return { current: currentIdx + 1, total: sectionQuestions.length };
    }

    // Fallback
    return { current: 0, total: sectionQuestions.length };
  };

  return (
    <QuizContext.Provider value={{ state, handleAnswer, nextQuestion, prevQuestion, getCurrentSection, getQuestionIndex }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
};
