import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterDef } from '../game/engine';
import { generateSpeedMathProblem, GradeLevel, SpeedMathProblem } from '../game/rules';
import { sound } from '../game/audio';

interface SpeedMathGameProps {
  character: CharacterDef;
  grade: GradeLevel;
  onFinish: (stats: { score: number; stars: number; correct: number; total: number }) => void;
  onExit: () => void;
}

export const SpeedMathGame: React.FC<SpeedMathGameProps> = ({
  character,
  grade,
  onFinish,
  onExit,
}) => {
  const [problem, setProblem] = useState<SpeedMathProblem>(() => generateSpeedMathProblem(grade));
  const [questionCount, setQuestionCount] = useState<number>(1);
  const totalQuestions = 7;
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(8);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string; sub: string } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Load next question
  const loadNext = useCallback(() => {
    if (questionCount >= totalQuestions) {
      // Completed!
      const finalStars = correctAnswers >= 6 ? 3 : correctAnswers >= 4 ? 2 : 1;
      onFinish({
        score,
        stars: finalStars,
        correct: correctAnswers,
        total: totalQuestions,
      });
      return;
    }

    setQuestionCount((prev) => prev + 1);
    setProblem(generateSpeedMathProblem(grade));
    setTimeLeft(8);
    setFeedback(null);
  }, [questionCount, totalQuestions, correctAnswers, score, grade, onFinish]);

  // Handle answer
  const handleAnswer = useCallback(
    (choice: number) => {
      if (feedback !== null) return; // Prevent double answers during feedback beat

      if (choice === problem.correct) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setCorrectAnswers((prev) => prev + 1);
        const pts = 100 * (nextCombo >= 3 ? 2 : 1) + Math.round(timeLeft * 10);
        setScore((prev) => prev + pts);

        if (nextCombo >= 3) {
          sound.playCombo();
        } else {
          sound.playCorrect();
        }

        setFeedback({
          isCorrect: true,
          text: nextCombo >= 3 ? `MANTAP! 🔥 ${nextCombo}x KOMBO!` : 'TEPAT SEKALI! ⭐',
          sub: `+${pts} Poin Cepat!`,
        });

        setTimeout(loadNext, 1100);
      } else {
        setCombo(0);
        sound.playWrong();
        setFeedback({
          isCorrect: false,
          text: 'Hampir Benar!',
          sub: problem.explanation,
        });

        setTimeout(loadNext, 1800);
      }
    },
    [feedback, problem, combo, timeLeft, loadNext]
  );

  // Keyboard number shortcuts (1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
        const idx = parseInt(e.code.replace('Digit', ''), 10) - 1;
        if (problem.options[idx] !== undefined) {
          handleAnswer(problem.options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [problem, handleAnswer]);

  // Question countdown timer
  useEffect(() => {
    if (feedback !== null) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Timeout counts as miss
          setCombo(0);
          sound.playWrong();
          setFeedback({
            isCorrect: false,
            text: 'Waktu Habis! ⏱️',
            sub: problem.explanation,
          });
          setTimeout(loadNext, 1800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [problem, feedback, loadNext]);

  const colors = [
    'from-blue-500 to-indigo-600 border-indigo-700',
    'from-emerald-500 to-teal-600 border-teal-700',
    'from-amber-500 to-orange-600 border-orange-700',
  ];

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-indigo-900 via-sky-900 to-slate-900 select-none overflow-y-auto text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-black px-3 py-1.5 rounded-2xl border border-white/20 transition-all cursor-pointer"
        >
          <span>✕</span>
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
          <span className="text-2xl">{character.emoji}</span>
          <span className="font-extrabold text-sm text-amber-300">
            Soal {questionCount} / {totalQuestions}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] text-emerald-300 font-bold uppercase">Skor Kilat</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
            {score}
          </span>
        </div>
      </div>

      {/* Main Flash Area */}
      <div className="max-w-xl mx-auto w-full my-auto flex flex-col items-center text-center py-4">
        {/* Combo Fire Banner */}
        {combo > 1 && (
          <div className="bg-amber-500/20 text-amber-400 border border-amber-400/40 font-black text-sm px-4 py-1 rounded-full mb-3 animate-pulse">
            🔥 {combo}x KOMBO BERUNTUN!
          </div>
        )}

        {/* Time Left Progress Gauge */}
        <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 4 ? 'bg-emerald-400' : timeLeft > 2 ? 'bg-amber-400' : 'bg-rose-500'
            }`}
            style={{ width: `${(timeLeft / 8) * 100}%` }}
          />
        </div>

        {/* Big Math Question Board */}
        <div className="bg-white/10 backdrop-blur-none border-4 border-amber-400 rounded-3xl p-6 sm:p-8 w-full shadow-2xl mb-8">
          <div className="text-xs uppercase font-extrabold text-amber-300 mb-2 tracking-wider">
            ⚡ Hitung Cepat ⚡
          </div>
          <div className="text-4xl sm:text-6xl font-black text-white font-display tracking-wide drop-shadow-lg">
            {problem.prompt}
          </div>
        </div>

        {/* Instant Answer Feedback Toast */}
        {feedback && (
          <div
            className={`w-full p-4 rounded-2xl border-3 shadow-2xl mb-6 ${
              feedback.isCorrect
                ? 'bg-emerald-500/90 border-emerald-300 text-white'
                : 'bg-rose-500/90 border-rose-300 text-white'
            }`}
          >
            <div className="font-black text-lg sm:text-xl">{feedback.text}</div>
            <div className="text-sm font-semibold opacity-90 mt-0.5">{feedback.sub}</div>
          </div>
        )}

        {/* Number Bubble Options (Buttons) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full">
          {problem.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={feedback !== null}
              onClick={() => handleAnswer(opt)}
              className={`p-4 sm:p-6 bg-gradient-to-b ${colors[idx % colors.length]} hover:scale-105 active:scale-95 rounded-3xl border-4 shadow-xl text-3xl sm:text-5xl font-black font-display text-white cursor-pointer transition-all flex flex-col items-center justify-center`}
            >
              <span>{opt}</span>
              <span className="text-[11px] opacity-75 font-sans mt-1">[{idx + 1}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* Control info */}
      <div className="text-center text-xs font-bold text-slate-400 pt-2 border-t border-slate-700/50">
        Klik balon angka atau tekan tombol keyboard [1], [2], [3] secepat mungkin!
      </div>
    </div>
  );
};
