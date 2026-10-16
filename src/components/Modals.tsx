import React from 'react';

// ==================== PAUSE MODAL ====================
interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onHome }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/60 select-none">
      <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-2">⏸️</div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 font-display">
          PERMAINAN DIJEDA
        </h2>
        <p className="text-sm font-semibold text-slate-600 mb-6">
          Istirahat sejenak sambil mengingat materi pelajaran!
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-lg rounded-2xl border-2 border-emerald-700 shadow-lg cursor-pointer transition-all"
          >
            ▶ Lanjutkan
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-lg rounded-2xl border-2 border-amber-600 shadow-md cursor-pointer transition-all"
          >
            🔄 Ulangi Soal
          </button>
          <button
            type="button"
            onClick={onHome}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-sm rounded-2xl border border-slate-300 cursor-pointer transition-all"
          >
            🏠 Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== VICTORY MODAL ====================
interface VictoryModalProps {
  score: number;
  stars: number;
  correctCount: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  stars,
  correctCount,
  totalQuestions,
  onPlayAgain,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/70 select-none">
      <div className="bg-white border-4 border-emerald-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
        {/* Trophy Icon */}
        <div className="text-6xl mb-2">🏆</div>

        <h2 className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1 font-display">
          HEBAT SEKALI!
        </h2>
        <p className="text-sm font-bold text-slate-600 mb-4">
          Kamu berhasil menyelesaikan semua soal petualangan!
        </p>

        {/* Stars Rating */}
        <div className="flex justify-center items-center gap-2 mb-6">
          {[1, 2, 3].map((starIdx) => {
            const isFilled = starIdx <= stars;
            return (
              <span
                key={starIdx}
                className={`text-4xl sm:text-5xl transition-transform ${
                  isFilled ? 'text-amber-400 scale-110 drop-shadow' : 'text-slate-200 scale-90'
                }`}
              >
                ★
              </span>
            );
          })}
        </div>

        {/* Mastery Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Skor Belajar</span>
            <span className="text-2xl font-black text-emerald-600 tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Akurasi Soal</span>
            <span className="text-2xl font-black text-sky-600 tabular-nums">
              {correctCount} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-white font-black text-xl rounded-2xl border-3 border-emerald-800 shadow-xl cursor-pointer transition-all"
          >
            🚀 Main Lagi / Tantangan Baru
          </button>
          <button
            type="button"
            onClick={onHome}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-sm rounded-2xl border border-slate-300 cursor-pointer transition-all"
          >
            🏠 Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== GAME OVER / REMEDIAL MODAL ====================
interface GameOverModalProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  correctCount,
  totalQuestions,
  onRetry,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/70 select-none">
      <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
        <div className="text-5xl mb-2">🌱</div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-600 mb-1 font-display">
          TETAP SEMANGAT!
        </h2>
        <p className="text-sm font-semibold text-slate-600 mb-4">
          Tidak apa-apa! Setiap petualang hebat belajar dari kesalahan untuk jadi semakin pintar.
        </p>

        {/* Progress Toward Goal Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Jawaban Benar</span>
            <span className="text-2xl font-black text-amber-600 tabular-nums">
              {correctCount} / {totalQuestions}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Skor Tercapai</span>
            <span className="text-2xl font-black text-slate-700 tabular-nums">{score}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-start="true"
            onClick={onRetry}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xl rounded-2xl border-3 border-amber-600 shadow-xl cursor-pointer transition-all"
          >
            💪 Coba Lagi, Aku Pasti Bisa!
          </button>
          <button
            type="button"
            onClick={onHome}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-sm rounded-2xl border border-slate-300 cursor-pointer transition-all"
          >
            🏠 Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ACHIEVEMENTS / PIALA MODAL ====================
interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const achievements = [
    {
      id: 'math',
      title: 'Jagoan Berhitung SD',
      desc: 'Selesaikan tantangan matematika dengan benar.',
      icon: '🔢',
      color: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    {
      id: 'science',
      title: 'Peneliti Alam Cilik',
      desc: 'Pelajari habitat hewan, tumbuhan, dan tata surya.',
      icon: '🌿',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      id: 'language',
      title: 'Kamus Berjalan',
      desc: 'Kuasai kosakata, sinonim, dan bahasa Indonesia baku.',
      icon: '📖',
      color: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    {
      id: 'culture',
      title: 'Penjelajah Nusantara',
      desc: 'Kenali bendera, candi, dan budaya Indonesia tercinta.',
      icon: '🇮🇩',
      color: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    {
      id: 'combo',
      title: 'Bintang Terang (5x Kombo)',
      desc: 'Jawab 5 soal berturut-turut tanpa salah!',
      icon: '🔥',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 select-none">
      <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            <h2 className="text-2xl font-black text-slate-800 font-display">
              Buku Prestasi Cerdas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 1L13 13M1 13L13 1" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 ${item.color}`}
            >
              <div className="text-3xl p-1 bg-white/80 rounded-xl shadow-sm">{item.icon}</div>
              <div className="flex-1">
                <div className="font-black text-sm">{item.title}</div>
                <div className="text-xs opacity-80 mt-0.5">{item.desc}</div>
              </div>
              <div className="text-amber-500 font-bold text-sm">⭐</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-3 bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black rounded-2xl border-2 border-amber-600 shadow cursor-pointer transition-all"
        >
          Kembali ke Permainan
        </button>
      </div>
    </div>
  );
};
