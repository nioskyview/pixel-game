import { useState } from 'react';
import { fetchQuestions, submitScore, Question } from './services/api';
import { LoginView } from './views/LoginView';
import { GameView } from './views/GameView';
import { ResultView } from './views/ResultView';
import { LeaderboardView } from './views/LeaderboardView';
import './App.css';

type ViewState = 'login' | 'loading' | 'game' | 'result' | 'leaderboard';

function App() {
  const [view, setView] = useState<ViewState>('login');
  const [playerId, setPlayerId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState<number>(0);

  const threshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3');
  const questionCount = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5');

  const handleLogin = async (id: string) => {
    setPlayerId(id);
    setView('loading');
    const data = await fetchQuestions(questionCount);
    setQuestions(data);
    setView('game');
  };

  const handleGameEnd = (finalScore: number) => {
    setScore(finalScore);
    setView('result');
  };

  const handleSubmitScore = async (name: string) => {
    await submitScore({
      id: playerId,
      playerName: name,
      score: score,
      timestamp: new Date().toISOString()
    });
  };

  const handleRetry = () => {
    setView('login');
    setScore(0);
    setQuestions([]);
  };

  return (
    <>
      <div className="crt-overlay"></div>
      <div className="app-wrapper">
        <div className="app-container">
          {view === 'login' && (
            <div className="login-wrapper">
              <LoginView onLogin={handleLogin} />
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setView('leaderboard'); }}
                  style={{ color: 'var(--secondary-color)', fontSize: '0.8rem', textDecoration: 'none' }}
                  className="blink"
                >
                  VIEW GLOBAL RANKING
                </a>
              </div>
            </div>
          )}

          {view === 'loading' && (
            <div className="loading-view stagger-1" style={{ textAlign: 'center' }}>
              <h2 className="blink" style={{ color: 'var(--secondary-color)' }}>LOADING...</h2>
            </div>
          )}

          {view === 'game' && questions.length > 0 && (
            <GameView questions={questions} onGameEnd={handleGameEnd} />
          )}

          {view === 'result' && (
            <ResultView
              score={score}
              totalQuestions={questions.length}
              threshold={threshold}
              onRetry={handleRetry}
              onViewLeaderboard={() => setView('leaderboard')}
              onSubmitScore={handleSubmitScore}
            />
          )}

          {view === 'leaderboard' && (
            <LeaderboardView onBack={() => setView('login')} />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
