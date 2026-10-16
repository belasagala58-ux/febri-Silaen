import React from 'react';
import { CHARACTERS, CharacterDef } from '../game/engine';
import { GradeLevel, getGradeDisplayName } from '../game/rules';

interface TitleScreenProps {
  selectedCharacter: CharacterDef;
  onSelectCharacter: (char: CharacterDef) => void;
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  onStartGame: () => void;
  onOpenAchievements: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  selectedGrade,
  onSelectGrade,
  onStartGame,
  onOpenAchievements,
}) => {
  const gradeOptions: GradeLevel[] = ['sd1-2', 'sd3-4', 'sd5-6'];

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200 select-none overflow-y-auto">
      {/* Decorative Sun and Cloud Backdrops */}
      <div className="absolute top-6 right-10 pointer-events-none opacity-80 animate-pulse-gentle">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" fill="#FBBF24" />
          <circle cx="50" cy="50" r="40" stroke="#FDE68A" strokeWidth="4" strokeDasharray="6 6" />
        </svg>
      </div>

      {/* Top Bar with Trophy Room CTA */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 bg-white/80 border-2 border-amber-400 rounded-full px-4 py-1.5 shadow-md">
          <span className="text-xl">🇮🇩</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-wide">
            Edukasi Kurikulum Merdeka SD
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenAchievements}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-extrabold text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-amber-600 shadow-md transition-all cursor-pointer"
        >
          <span className="text-lg">🏆</span>
          <span>Piala & Prestasi</span>
        </button>
      </div>

      {/* Centerpiece Hero Title & SVG Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-4">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="relative mb-2">
          <svg className="w-72 sm:w-96 md:w-[480px] h-auto drop-shadow-xl" viewBox="0 0 500 120" fill="none">
            {/* Banner ribbon backdrop */}
            <path
              d="M30 70 L60 20 L440 20 L470 70 L440 105 L60 105 Z"
              fill="#F97316"
              stroke="#C2410C"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M45 68 L70 28 L430 28 L455 68 L430 98 L70 98 Z"
              fill="#FB923C"
            />
            {/* Stars decoration */}
            <polygon points="50,45 55,55 65,55 57,62 60,72 50,65 40,72 43,62 35,55 45,55" fill="#FACC15" />
            <polygon points="450,45 455,55 465,55 457,62 460,72 450,65 440,72 443,62 435,55 445,55" fill="#FACC15" />
            
            {/* Title Text */}
            <text
              x="250"
              y="60"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="'Fredoka', cursive, sans-serif"
              fontWeight="900"
              fontSize="38"
              letterSpacing="2"
              stroke="#9A3412"
              strokeWidth="3"
              style={{ paintOrder: 'stroke fill' }}
            >
              PETUALANG CILIK
            </text>
            <text
              x="250"
              y="92"
              textAnchor="middle"
              fill="#FEF08A"
              fontFamily="'Fredoka', cursive, sans-serif"
              fontWeight="800"
              fontSize="22"
              letterSpacing="2"
            >
              EDUKASI PINTAR SD
            </text>
          </svg>
        </div>

        <p className="text-slate-800 font-bold text-sm sm:text-base max-w-lg mb-6 drop-shadow-sm">
          Ayo jelajahi pulau ilmu! Selesaikan tantangan Matematika, Sains, Bahasa, dan Budaya Nusantara untuk mengumpulkan bintang emas!
        </p>

        {/* Grade Level Selector */}
        <div className="bg-white/90 backdrop-blur-none p-3 sm:p-4 rounded-3xl border-3 border-sky-400 shadow-xl max-w-xl w-full mb-5">
          <div className="text-xs font-black text-sky-800 uppercase tracking-wider mb-2">
            Pilih Jenjang Kelas Kamu:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {gradeOptions.map((g) => {
              const info = getGradeDisplayName(g);
              const isSelected = selectedGrade === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => onSelectGrade(g)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-md scale-102 font-extrabold ring-2 ring-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-sm sm:text-base font-black">{info.label}</span>
                  <span className="text-[11px] opacity-80 hidden sm:inline">{info.ageHint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Mascot Picker */}
        <div className="bg-white/90 p-3 sm:p-4 rounded-3xl border-3 border-emerald-400 shadow-xl max-w-xl w-full mb-6">
          <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2">
            Pilih Pahlawan Belajarmu:
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CHARACTERS.map((char) => {
              const isSelected = selectedCharacter.id === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => onSelectCharacter(char)}
                  className={`p-3 rounded-2xl flex flex-col items-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-emerald-400 border-emerald-700 text-emerald-950 shadow-lg scale-105 font-extrabold ring-2 ring-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl mb-1">{char.emoji}</span>
                  <span className="text-xs sm:text-sm font-bold">{char.name}</span>
                  <span className="text-[10px] opacity-75">{char.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Game CTA Button */}
        <button
          type="button"
          data-start="true"
          onClick={onStartGame}
          className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 hover:scale-105 active:scale-95 text-white font-black text-xl sm:text-2xl px-10 py-4 rounded-full border-4 border-emerald-800 shadow-2xl transition-all cursor-pointer"
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform">🚀</span>
          <span>MULAI PETUALANGAN!</span>
          <span className="text-xs font-bold bg-emerald-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
            [ENTER]
          </span>
        </button>
      </div>

      {/* Flat borderless control hint line at bottom */}
      <div className="relative z-10 text-center py-2 text-xs sm:text-sm text-slate-700 font-bold border-t border-slate-700/10">
        WASD / Panah: Gerak & Lompat · Spasi / Klik: Lompat & Pilih Balon · 1-4: Pilih Jawaban · P: Jeda · M: Suara
      </div>
    </div>
  );
};
