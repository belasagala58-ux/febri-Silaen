import React from 'react';
import { CHARACTERS, CharacterDef } from '../game/engine';
import { GradeLevel, getGradeDisplayName } from '../game/rules';

export type GameMode = 'runner' | 'speedmath' | 'science';

interface HomeScreenProps {
  selectedCharacter: CharacterDef;
  onSelectCharacter: (char: CharacterDef) => void;
  selectedGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  totalStars: number;
  onStartGame: (mode: GameMode) => void;
  onOpenAchievements: () => void;
  onBackToWelcome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  selectedGrade,
  onSelectGrade,
  totalStars,
  onStartGame,
  onOpenAchievements,
  onBackToWelcome,
  isMuted,
  onToggleMute,
}) => {
  const gradeOptions: GradeLevel[] = ['sd1-2', 'sd3-4', 'sd5-6'];
  const currentGradeInfo = getGradeDisplayName(selectedGrade);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 select-none overflow-y-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full mb-4">
        {/* Left: Back to Welcome & Mascot info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToWelcome}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs sm:text-sm font-black px-3 py-1.5 rounded-2xl border-2 border-slate-300 shadow cursor-pointer transition-all active:scale-95"
          >
            <span>◀</span>
            <span className="hidden sm:inline">Halaman Welcome</span>
          </button>

          <div className="flex items-center gap-2 bg-white/95 border-2 border-amber-400 rounded-2xl px-3 py-1.5 shadow">
            <span className="text-2xl">{selectedCharacter.emoji}</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 leading-none">
                {selectedCharacter.name}
              </span>
              <span className="text-[10px] text-amber-700 font-bold">
                {currentGradeInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Stars Total, Achievements & Sound Mute */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-400 border-2 border-amber-600 rounded-2xl px-3 py-1.5 shadow text-amber-950 font-black text-xs sm:text-sm">
            <span className="text-base">⭐</span>
            <span>{totalStars} Bintang</span>
          </div>

          <button
            type="button"
            onClick={onOpenAchievements}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 font-black text-xs sm:text-sm px-3 py-1.5 rounded-2xl border-2 border-slate-300 shadow cursor-pointer transition-all active:scale-95"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">Prestasi</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 rounded-2xl shadow cursor-pointer transition-all active:scale-95"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Main Hub Body */}
      <div className="max-w-5xl mx-auto w-full my-auto py-2">
        {/* Title Bar */}
        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display drop-shadow-sm">
            Pusat Petualangan Belajar SD
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
            Pilih jenjang kelas dan mode game favoritmu untuk mulai mengasah otak!
          </p>
        </div>

        {/* Grade Level Selector Tabs */}
        <div className="bg-white/90 p-3 rounded-3xl border-3 border-sky-400 shadow-lg max-w-2xl mx-auto mb-6">
          <div className="text-[11px] font-black text-sky-800 uppercase tracking-wider text-center mb-2">
            Jenjang Belajar Aktif:
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
                  className={`p-2 sm:p-2.5 rounded-2xl flex flex-col items-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-md font-black ring-2 ring-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black">{info.label}</span>
                  <span className="text-[10px] opacity-75">{info.ageHint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Three Exciting Game Modes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Mode 1: Island Runner Balloon Quiz */}
          <div className="bg-white/95 rounded-3xl p-5 border-4 border-emerald-400 shadow-xl flex flex-col justify-between hover:border-emerald-500 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">🏃‍♂️🎈</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  Semua Mapel
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 font-display mb-1.5">
                Petualangan Lari & Kuis Balon
              </h3>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4">
                Karaktermu berlari melompati bukit, mengambil bintang, dan melompat menembus balon jawaban yang melayang di langit!
              </p>
            </div>
            <button
              type="button"
              data-start="true"
              onClick={() => onStartGame('runner')}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl border-2 border-emerald-800 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>🚀 Mainkan Petualangan</span>
            </button>
          </div>

          {/* Mode 2: Speed Math Blitz */}
          <div className="bg-white/95 rounded-3xl p-5 border-4 border-amber-400 shadow-xl flex flex-col justify-between hover:border-amber-500 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">⚡🔢</span>
                <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  Matematika Cepat
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 font-display mb-1.5">
                Sambaran Kilat Angka
              </h3>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4">
                Hitung cepat penjumlahan, pengurangan, perkalian sebelum balon meletus! Raih kombo api tertinggi!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartGame('speedmath')}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-amber-950 font-black text-sm sm:text-base rounded-2xl border-2 border-amber-600 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>⚡ Mulai Kilat Angka</span>
            </button>
          </div>

          {/* Mode 3: Science & Culture Quiz */}
          <div className="bg-white/95 rounded-3xl p-5 border-4 border-sky-400 shadow-xl flex flex-col justify-between hover:border-sky-500 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">🌿🇮🇩</span>
                <span className="bg-sky-100 text-sky-900 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  Sains & Nusantara
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 font-display mb-1.5">
                Eksplorasi Sains & Nusantara
              </h3>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4">
                Pelajari rahasia alam, hewan langka, tata surya, dan budaya Nusantara Indonesia tercinta!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartGame('science')}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl border-2 border-sky-800 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>🌟 Jelajahi Pengetahuan</span>
            </button>
          </div>
        </div>

        {/* Mascot Switching Row */}
        <div className="bg-white/85 p-3 rounded-2xl border-2 border-slate-300 flex flex-wrap items-center justify-between gap-3 max-w-2xl mx-auto shadow-sm">
          <span className="text-xs font-black text-slate-700">Pahlawan Terpilih:</span>
          <div className="flex items-center gap-2">
            {CHARACTERS.map((char) => {
              const isSelected = selectedCharacter.id === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => onSelectCharacter(char)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-400 border-emerald-600 text-emerald-950 font-black shadow'
                      : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 font-bold'
                  }`}
                >
                  <span className="text-xl">{char.emoji}</span>
                  <span className="text-xs">{char.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer controls hint */}
      <div className="text-center text-xs font-bold text-slate-600 pt-2 border-t border-slate-700/10">
        Pilih mode permainan di atas untuk mulai bermain dan mengumpulkan bintang emas!
      </div>
    </div>
  );
};
