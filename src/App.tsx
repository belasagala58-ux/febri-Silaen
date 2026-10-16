/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CHARACTERS, CharacterDef, GameEngine } from './game/engine';
import { getRandomQuestions, Question, getQuestionsByGrade } from './game/questions';
import { GradeLevel } from './game/rules';
import { sound } from './game/audio';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen, GameMode } from './components/HomeScreen';
import { HUD } from './components/HUD';
import { SpeedMathGame } from './components/SpeedMathGame';
import { PauseModal, VictoryModal, GameOverModal, AchievementsModal } from './components/Modals';

export type AppView = 'welcome' | 'home' | 'game-runner' | 'game-speedmath';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Core View State Machine: Welcome -> Home -> Game
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterDef>(CHARACTERS[0]);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('sd1-2');
  const [totalStars, setTotalStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('petualang_cilik_stars');
      return saved ? parseInt(saved, 10) : 12;
    } catch {
      return 12;
    }
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Runner HUD metrics
  const [hp, setHp] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(6);

  // End-of-Run Snapshot
  const [runOutcome, setRunOutcome] = useState<{
    victory: boolean;
    score: number;
    stars: number;
    correct: number;
    total: number;
  } | null>(null);

  // Sync state to body dataset
  useEffect(() => {
    if (runOutcome) {
      document.body.dataset.state = 'gameover';
    } else if (isPaused) {
      document.body.dataset.state = 'paused';
    } else if (currentView === 'welcome') {
      document.body.dataset.state = 'welcome';
    } else if (currentView === 'home') {
      document.body.dataset.state = 'title';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [currentView, isPaused, runOutcome]);

  // Sound mute sync
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Initialize Game Engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onScoreUpdate: (newScore, newCombo) => {
        setScore(newScore);
        setCombo(newCombo);
      },
      onHpUpdate: (newHp) => {
        setHp(newHp);
      },
      onQuestionChange: (q, idx, total) => {
        setCurrentQuestion(q);
        setQuestionIndex(idx);
        setTotalQuestions(total);
      },
      onAnswerResult: () => {},
      onLevelComplete: (victory, stats) => {
        if (victory) {
          setTotalStars((prev) => {
            const updated = prev + stats.stars;
            try {
              localStorage.setItem('petualang_cilik_stars', String(updated));
            } catch {}
            return updated;
          });
        }
        setRunOutcome({
          victory,
          score: stats.score,
          stars: stats.stars,
          correct: stats.correct,
          total: stats.total,
        });
      },
    });

    engineRef.current = engine;

    const handleResize = () => {
      engine.resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Support ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const qList = getRandomQuestions('sd1-2', 6);
      engine.startLevel(CHARACTERS[0], 'sd1-2', qList);
      setCurrentView('game-runner');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, []);

  // Transition from Welcome to Home
  const handleEnterHome = useCallback(() => {
    sound.playClick();
    sound.playVictory();
    setCurrentView('home');
  }, []);

  // Start selected game mode
  const handleStartGame = useCallback(
    (mode: GameMode) => {
      sound.playClick();
      setRunOutcome(null);
      setIsPaused(false);

      if (mode === 'speedmath') {
        if (engineRef.current) engineRef.current.stop();
        setCurrentView('game-speedmath');
      } else {
        // Runner mode: either all subjects or science & culture focus
        let qList: Question[] = [];
        if (mode === 'science') {
          const pool = getQuestionsByGrade(selectedGrade).filter(
            (q) => q.subject === 'science' || q.subject === 'culture'
          );
          qList = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
          if (qList.length < 4) {
            qList = getRandomQuestions(selectedGrade, 6);
          }
        } else {
          qList = getRandomQuestions(selectedGrade, 6);
        }

        setScore(0);
        setCombo(0);
        setHp(3);
        if (engineRef.current) {
          engineRef.current.startLevel(selectedCharacter, selectedGrade, qList);
        }
        setCurrentView('game-runner');
      }
    },
    [selectedCharacter, selectedGrade]
  );

  // Pause & Resume for Runner
  const handlePause = useCallback(() => {
    if (currentView === 'game-runner' && engineRef.current) {
      engineRef.current.pause();
      setIsPaused(true);
    }
  }, [currentView]);

  const handleResume = useCallback(() => {
    if (currentView === 'game-runner' && engineRef.current) {
      engineRef.current.resume();
      setIsPaused(false);
    }
  }, [currentView]);

  const handleGoHome = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsPaused(false);
    setRunOutcome(null);
    setCurrentView('home');
  }, []);

  // Finish Speed Math Blitz
  const handleFinishSpeedMath = (stats: {
    score: number;
    stars: number;
    correct: number;
    total: number;
  }) => {
    const isWin = stats.correct >= 4;
    if (isWin) {
      sound.playVictory();
      setTotalStars((prev) => {
        const updated = prev + stats.stars;
        try {
          localStorage.setItem('petualang_cilik_stars', String(updated));
        } catch {}
        return updated;
      });
    } else {
      sound.playGameOver();
    }

    setRunOutcome({
      victory: isWin,
      score: stats.score,
      stars: stats.stars,
      correct: stats.correct,
      total: stats.total,
    });
  };

  // Global key bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView === 'welcome') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleEnterHome();
        }
      } else if (currentView === 'game-runner') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          if (isPaused) {
            handleResume();
          } else {
            handlePause();
          }
        }
      }

      if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isPaused, handleEnterHome, handlePause, handleResume, handleToggleMute]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* 60fps Canvas Viewport Container (Always present in background for runner) */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className={`absolute inset-0 w-full h-full block cursor-pointer ${
          currentView === 'game-runner' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 1. HALAMAN WELCOME */}
      {currentView === 'welcome' && (
        <WelcomeScreen
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
          onEnterHome={handleEnterHome}
        />
      )}

      {/* 2. HALAMAN HOME (DASHBOARD HUB) */}
      {currentView === 'home' && (
        <HomeScreen
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
          selectedGrade={selectedGrade}
          onSelectGrade={setSelectedGrade}
          totalStars={totalStars}
          onStartGame={handleStartGame}
          onOpenAchievements={() => setShowAchievements(true)}
          onBackToWelcome={() => setCurrentView('welcome')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 3. GAME MODE 1: ISLAND RUNNER HUD */}
      {currentView === 'game-runner' && (
        <HUD
          character={selectedCharacter}
          hp={hp}
          maxHp={3}
          score={score}
          combo={combo}
          currentQuestion={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onRestart={() => handleStartGame('runner')}
          onTouchMoveLeft={(pressed) => engineRef.current?.triggerMove(pressed ? -1 : 0)}
          onTouchMoveRight={(pressed) => engineRef.current?.triggerMove(pressed ? 1 : 0)}
          onTouchJump={() => engineRef.current?.triggerJump()}
        />
      )}

      {/* 4. GAME MODE 2: SPEED MATH BLITZ */}
      {currentView === 'game-speedmath' && (
        <SpeedMathGame
          character={selectedCharacter}
          grade={selectedGrade}
          onFinish={handleFinishSpeedMath}
          onExit={handleGoHome}
        />
      )}

      {/* PAUSE MODAL */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={() => handleStartGame('runner')}
          onHome={handleGoHome}
        />
      )}

      {/* VICTORY & GAME OVER MODALS */}
      {runOutcome && (
        runOutcome.victory ? (
          <VictoryModal
            score={runOutcome.score}
            stars={runOutcome.stars}
            correctCount={runOutcome.correct}
            totalQuestions={runOutcome.total}
            onPlayAgain={() => handleStartGame('runner')}
            onHome={handleGoHome}
          />
        ) : (
          <GameOverModal
            score={runOutcome.score}
            correctCount={runOutcome.correct}
            totalQuestions={runOutcome.total}
            onRetry={() => handleStartGame('runner')}
            onHome={handleGoHome}
          />
        )
      )}

      {/* ACHIEVEMENTS / BUKU PRESTASI MODAL */}
      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}
    </div>
  );
}
