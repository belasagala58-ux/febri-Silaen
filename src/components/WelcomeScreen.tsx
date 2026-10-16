import React from 'react';
import { CHARACTERS, CharacterDef } from '../game/engine';

interface WelcomeScreenProps {
  selectedCharacter: CharacterDef;
  onEnterHome: () => void;
  onSelectCharacter: (char: CharacterDef) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  selectedCharacter,
  onEnterHome,
  onSelectCharacter,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 select-none overflow-y-auto">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2 bg-white/90 border-2 border-amber-400 rounded-full px-4 py-1.5 shadow-md">
          <span className="text-xl">🇮🇩</span>
          <span className="font-extrabold text-xs sm:text-sm text-slate-800">
            Game Edukasi Anak SD Terpadu
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-400/90 border-2 border-amber-600 rounded-full px-3 py-1 shadow-sm text-xs font-black text-amber-950">
          <span>⭐</span>
          <span>Kurikulum Merdeka</span>
        </div>
      </div>

      {/* Main Welcoming Centerpiece */}
      <div className="my-auto py-6 max-w-3xl mx-auto w-full flex flex-col items-center text-center">
        {/* Animated Friendly Mascot Showcase */}
        <div className="relative mb-3">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/90 border-4 border-amber-400 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl transition-transform hover:scale-105">
            {selectedCharacter.emoji}
          </div>
          <span className="absolute -bottom-2 bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-emerald-700 shadow">
            {selectedCharacter.name}
          </span>
        </div>

        {/* Mascot Speech Bubble Greeting */}
        <div className="relative bg-white/95 border-3 border-sky-400 rounded-3xl p-4 sm:p-5 shadow-xl max-w-lg mb-6 text-slate-800">
          <div className="text-base sm:text-lg font-black text-sky-800 mb-1">
            "Halo Sobat Juara! Selamat Datang di Dunia Petualang Cilik! 👋🎒"
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Ayo asah kepintaranmu sambil bermain game petualangan lari, kuis balon langit, dan sambaran angka kilat. Siap kumpulkan semua piala?
          </p>
        </div>

        {/* Quick Mascot Selector */}
        <div className="flex items-center gap-3 mb-6 bg-white/80 p-2 sm:px-4 sm:py-2.5 rounded-2xl border-2 border-slate-300 shadow-sm">
          <span className="text-xs font-black text-slate-700">Pilih Teman Belajarmu:</span>
          <div className="flex gap-2">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectCharacter(char)}
                title={char.name}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all cursor-pointer border-2 ${
                  selectedCharacter.id === char.id
                    ? 'bg-amber-400 border-amber-600 scale-110 shadow'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                }`}
              >
                {char.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* High-Impact Entry CTA Button */}
        <button
          type="button"
          data-start="true"
          onClick={onEnterHome}
          className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 hover:scale-105 active:scale-95 text-white font-black text-xl sm:text-2xl px-10 py-4 rounded-full border-4 border-emerald-800 shadow-2xl transition-all cursor-pointer"
        >
          <span>🎒</span>
          <span>MASUK KE HALAMAN UTAMA</span>
          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {/* Three Fun Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 max-w-xl w-full text-center">
          <div className="bg-white/85 p-2.5 sm:p-3 rounded-2xl border-2 border-amber-300 shadow-sm">
            <div className="text-2xl mb-1">🎮</div>
            <div className="font-black text-xs text-slate-800">Bermain Seru</div>
            <div className="text-[10px] text-slate-600">Lari, lompat & pecahkan balon</div>
          </div>
          <div className="bg-white/85 p-2.5 sm:p-3 rounded-2xl border-2 border-sky-300 shadow-sm">
            <div className="text-2xl mb-1">🧠</div>
            <div className="font-black text-xs text-slate-800">Pasti Pintar</div>
            <div className="text-[10px] text-slate-600">Matematika, IPA & Bahasa</div>
          </div>
          <div className="bg-white/85 p-2.5 sm:p-3 rounded-2xl border-2 border-emerald-300 shadow-sm">
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-black text-xs text-slate-800">Koleksi Bintang</div>
            <div className="text-[10px] text-slate-600">Dapatkan piala kebanggaan</div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs font-bold text-slate-600 pt-2 border-t border-slate-700/10">
        Siap di-hosting langsung di Vercel · HTML, CSS, JavaScript Modern & Responsive
      </div>
    </div>
  );
};
