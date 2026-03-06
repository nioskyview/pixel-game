import { useGameState } from './shared/hooks/useGameState';
import { AudioProvider } from './shared/contexts/AudioContext';
import { AudioToggle } from './shared/components/AudioToggle';
import { LoginView } from './features/auth/LoginView';
import { GameView } from './features/quiz/GameView';
import { ResultView } from './features/quiz/ResultView';
import { LeaderboardView } from './features/quiz/LeaderboardView';
import './App.css';

function App() {
  const {
    state,
    questions,
    score,
    error,
    login,
    completeQuiz,
    handleSumbitScore,
    showLeaderboard,
    restart,
    backToMenu
  } = useGameState();

  const threshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3');

  const renderView = () => {
    switch (state) {
      case 'LOGIN':
        return <LoginView onLogin={login} />;
      case 'LOADING':
        return (
          <div className="login-view" style={{ textAlign: 'center' }}>
            <h1 className="blink" style={{ color: 'var(--secondary-color)' }}>LOADING...</h1>
            <p>FETCHING DATA FROM ARCADE</p>
          </div>
        );
      case 'QUIZ':
        return <GameView questions={questions} onGameEnd={completeQuiz} />;
      case 'RESULTS':
        return (
          <ResultView
            score={score}
            totalQuestions={questions.length}
            threshold={threshold}
            onRetry={restart}
            onViewLeaderboard={showLeaderboard}
            onSubmitScore={handleSumbitScore}
          />
        );
      case 'LEADERBOARD':
        return <LeaderboardView onBack={backToMenu} />;
      case 'ERROR':
        return (
          <div className="login-view" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--danger-color)' }}>ERROR</h1>
            <p style={{ marginBottom: '30px' }}>{error}</p>
            <button className="pixel-button" onClick={restart}>TRY AGAIN</button>
          </div>
        );
      default:
        return <LoginView onLogin={login} />;
    }
  };

  return (
    <AudioProvider>
      <div className="crt-overlay"></div>
      <div className="app-wrapper">
        <AudioToggle />
        <div className="app-container">
          {renderView()}
        </div>
      </div>
    </AudioProvider>
  );
}

export default App;
