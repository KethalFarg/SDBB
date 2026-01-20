import React from 'react';
import { QuizProvider } from './context/QuizContext';
import { QuizRenderer } from './pages/QuizRenderer';

const App: React.FC = () => {
  return (
    <QuizProvider>
      <QuizRenderer />
    </QuizProvider>
  );
};

export default App;
