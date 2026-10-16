import React from 'react';
import { Question } from '../game/questions';
import { CharacterDef } from '../game/engine';

interface HUDProps {
  character: CharacterDef;
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  currentQuestion: Question | null;
  questionIndex: number;
  totalQuestions: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onTouchMoveLeft: (pressed: boolean) => void;
  onTouchMoveRight: (pressed: boolean) => void;
  onTouchJump: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  character,
  hp,
  maxHp,
  score,
  combo,
  currentQuestion,
  questionIndex,
  totalQuestions,
  isMuted,
  onToggleMute,
  onPause,
  onRestart,
  onTouchMoveLeft,
  onTouchMoveRight,
  onTouchJump,
}) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Perimeter Status Cluster */}
      <div className="flex items-start justify-between gap-3 w-full max-w-6xl mx-auto">
        {/* Top-Left: Character Avatar & Vitality Hearts */}
        <div className="flex items-center gap-3 bg-white/95 border-3 border-amber-400 rounded-3xl p-2 sm:px-4 sm:py-2.5 shadow-lg pointer-events-auto">
          <div className="text-3xl sm:text-4xl filter drop-shadow-sm animate-pulse-gentle">
            {character.emoji}
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight">
              {character.name}
            </span>
            {/* Vitality Heart Pips */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: maxHp }).map((_, i) => {
                const isFull = i < hp;
                return (
                  <span
                    key={i}
                    className={`text-lg sm:text-xl transition-transform ${
                      isFull ? 'scale-100 text-rose-500' : 'scale-90 text-slate-300 opacity-60'
                    }`}
                  >
                    ❤️
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top-Center: Current Question Prompt Card */}
        {currentQuestion && (
          <div className="flex-1 max-w-xl mx-2 bg-white/95 border-3 border-sky-400 rounded-3xl p-3 sm:p-4 shadow-xl text-center pointer-events-auto">
            {/* Subject badge and question step */}
            <div className="flex items-center justify-between mb-1.5 px-2">
              <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                <span>{currentQuestion.subjectIcon}</span>
                <span>{currentQuestion.subjectName}</span>
              </span>
              <span className="text-xs font-black text-slate-500">
                Soal {questionIndex} / {totalQuestions}
              </span>
            </div>

            {/* Prompt text */}
            <div className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
              {currentQuestion.prompt}
            </div>

            {/* Visual hint if present */}
            {currentQuestion.visualHint && (
              <div className="mt-1 text-xs sm:text-sm font-bold text-amber-600 bg-amber-50 rounded-xl py-0.5 px-2 inline-block">
                {currentQuestion.visualHint}
              </div>
            )}
          </div>
        )}

        {/* Top-Right: Score, Combo & Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Score & Combo readout */}
          <div className="flex flex-col items-end bg-white/95 border-3 border-emerald-400 rounded-3xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg pointer-events-auto">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              SKOR BELAJAR
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 tabular-nums leading-none">
              {score}
            </div>
            {combo > 1 && (
              <div className="flex items-center gap-1 mt-0.5 text-xs font-black text-amber-500 animate-pulse">
                <span>🔥</span>
                <span>{combo}x KOMBO</span>
              </div>
            )}
          </div>

          {/* Quick Utility Icon Buttons (Mute, Pause, Restart) */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              title="Suara (M)"
              aria-label="Toggle Suara"
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 rounded-xl shadow cursor-pointer transition-all active:scale-95 text-base"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              title="Jeda (Esc/P)"
              aria-label="Jeda Permainan"
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 rounded-xl shadow cursor-pointer transition-all active:scale-95 font-black text-sm"
            >
              ⏸️
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onRestart();
              }}
              title="Ulangi (R)"
              aria-label="Ulangi Level"
              className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 rounded-xl shadow cursor-pointer transition-all active:scale-95 font-black text-sm"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Touch On-Screen Controls in Bottom Corners */}
      <div className="flex items-end justify-between w-full max-w-5xl mx-auto pb-2 sm:hidden pointer-events-none">
        {/* Left & Right D-Pad buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onPointerDown={() => onTouchMoveLeft(true)}
            onPointerUp={() => onTouchMoveLeft(false)}
            onPointerLeave={() => onTouchMoveLeft(false)}
            className="w-14 h-14 bg-white/90 active:bg-amber-300 text-slate-900 border-3 border-amber-400 rounded-2xl shadow-xl flex items-center justify-center text-2xl font-black select-none"
            aria-label="Gerak Kiri"
          >
            ◀
          </button>
          <button
            type="button"
            onPointerDown={() => onTouchMoveRight(true)}
            onPointerUp={() => onTouchMoveRight(false)}
            onPointerLeave={() => onTouchMoveRight(false)}
            className="w-14 h-14 bg-white/90 active:bg-amber-300 text-slate-900 border-3 border-amber-400 rounded-2xl shadow-xl flex items-center justify-center text-2xl font-black select-none"
            aria-label="Gerak Kanan"
          >
            ▶
          </button>
        </div>

        {/* Jump Button */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onPointerDown={onTouchJump}
            className="w-16 h-16 bg-emerald-500 active:bg-emerald-600 text-white border-3 border-emerald-700 rounded-full shadow-2xl flex flex-col items-center justify-center font-black select-none"
            aria-label="Lompat"
          >
            <span className="text-xl leading-none">⬆</span>
            <span className="text-[10px] leading-tight">LOMPAT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
