/**
 * Core game rules, scoring math, and progression logic.
 * Decoupled from DOM/React for fast deterministic unit testing.
 */

export type GradeLevel = 'sd1-2' | 'sd3-4' | 'sd5-6';

export type SubjectCategory = 'math' | 'science' | 'indonesian' | 'culture';

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
  starsEarned: number;
  elapsedSeconds: number;
}

export function calculateScore(basePoints: number, combo: number, speedMultiplier: number = 1.0): number {
  const comboMultiplier = getComboMultiplier(combo);
  const raw = basePoints * comboMultiplier * Math.max(0.8, Math.min(2.0, speedMultiplier));
  return Math.round(raw);
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 8) return 3.0;
  if (combo >= 5) return 2.5;
  if (combo >= 3) return 2.0;
  if (combo >= 2) return 1.5;
  return 1.0;
}

export function calculateStars(correctCount: number, totalQuestions: number, remainingHpRatio: number = 1.0): number {
  if (totalQuestions <= 0) return 1;
  const accuracy = correctCount / totalQuestions;
  
  if (accuracy >= 0.85 && remainingHpRatio >= 0.5) {
    return 3;
  }
  if (accuracy >= 0.6) {
    return 2;
  }
  return 1;
}

export function applyDamage(currentHp: number, damage: number = 1): number {
  return Math.max(0, currentHp - damage);
}

export function healPlayer(currentHp: number, amount: number = 1, maxHp: number = 3): number {
  return Math.min(maxHp, currentHp + amount);
}

export function evaluateAnswer(selectedAnswer: string | number, correctAnswer: string | number): boolean {
  const cleanSelected = String(selectedAnswer).trim().toLowerCase();
  const cleanCorrect = String(correctAnswer).trim().toLowerCase();
  return cleanSelected === cleanCorrect;
}

export function checkLevelClear(
  questionsAnswered: number,
  targetQuestions: number,
  currentHp: number
): { isComplete: boolean; isVictory: boolean } {
  if (currentHp <= 0) {
    return { isComplete: true, isVictory: false };
  }
  if (questionsAnswered >= targetQuestions) {
    return { isComplete: true, isVictory: true };
  }
  return { isComplete: false, isVictory: false };
}

export function getFeedbackMessage(isCorrect: boolean, combo: number): {
  title: string;
  subtitle: string;
  soundType: 'correct' | 'wrong' | 'combo';
} {
  if (isCorrect) {
    if (combo >= 5) {
      return {
        title: 'LUAR BIASA! 🔥🔥🔥',
        subtitle: `${combo}x Jawaban Benar Beruntun! Kamu Hebat Sekali!`,
        soundType: 'combo',
      };
    }
    if (combo >= 3) {
      return {
        title: 'MANTAP JIWA! ⭐⭐',
        subtitle: `${combo}x Benar! Terus Pertahankan!`,
        soundType: 'combo',
      };
    }
    const praises = [
      'Pintar Sekali! 🌟',
      'Jawabanmu Tepat! ✨',
      'Hebat! Ayo Lanjut! 🚀',
      'Keren Banget! 🎯',
    ];
    const picked = praises[Math.floor(Math.random() * praises.length)] || praises[0];
    return {
      title: picked,
      subtitle: '+100 Poin Belajar!',
      soundType: 'correct',
    };
  }

  const encouragements = [
    { title: 'Hampir Benar!', subtitle: 'Jangan menyerah, coba lagi ya!' },
    { title: 'Tetap Semangat!', subtitle: 'Belajar dari kesalahan membuatmu makin pintar!' },
    { title: 'Ayo Fokus!', subtitle: 'Baca soalnya perlahan-lahan ya.' },
  ];
  const picked = encouragements[Math.floor(Math.random() * encouragements.length)] || encouragements[0];
  return {
    title: picked.title,
    subtitle: picked.subtitle,
    soundType: 'wrong',
  };
}

export function getGradeDisplayName(gradeId: GradeLevel): { label: string; sublabel: string; ageHint: string } {
  switch (gradeId) {
    case 'sd1-2':
      return {
        label: 'Kelas 1 - 2 SD',
        sublabel: 'Tingkat Pemula (Bintang Cilik)',
        ageHint: 'Usia 6 - 8 Tahun',
      };
    case 'sd3-4':
      return {
        label: 'Kelas 3 - 4 SD',
        sublabel: 'Tingkat Menengah (Petualang Pintar)',
        ageHint: 'Usia 8 - 10 Tahun',
      };
    case 'sd5-6':
      return {
        label: 'Kelas 5 - 6 SD',
        sublabel: 'Tingkat Mahir (Ksatria Cerdas)',
        ageHint: 'Usia 10 - 12 Tahun',
      };
  }
}

export interface SpeedMathProblem {
  prompt: string;
  correct: number;
  options: number[];
  explanation: string;
}

export function generateSpeedMathProblem(grade: GradeLevel): SpeedMathProblem {
  let a = 0;
  let b = 0;
  let op: '+' | '-' | '×' = '+';
  let ans = 0;

  if (grade === 'sd1-2') {
    // Numbers 1-15, + and -
    op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      ans = a + b;
    } else {
      a = Math.floor(Math.random() * 10) + 5;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      ans = a - b;
    }
  } else if (grade === 'sd3-4') {
    // Multiplication 2-9 or larger addition
    const pick = Math.random();
    if (pick < 0.6) {
      op = '×';
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      ans = a * b;
    } else {
      op = '+';
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * 40) + 10;
      ans = a + b;
    }
  } else {
    // Grade 5-6: mixed multiplication or higher operations
    const pick = Math.random();
    if (pick < 0.5) {
      op = '×';
      a = Math.floor(Math.random() * 12) + 4;
      b = Math.floor(Math.random() * 12) + 3;
      ans = a * b;
    } else {
      op = '-';
      a = Math.floor(Math.random() * 100) + 50;
      b = Math.floor(Math.random() * 45) + 10;
      ans = a - b;
    }
  }

  // Generate 3 plausible unique options
  const optionsSet = new Set<number>([ans]);
  while (optionsSet.size < 3) {
    const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    const candidate = Math.max(0, ans + delta);
    if (candidate !== ans) {
      optionsSet.add(candidate);
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    prompt: `${a} ${op} ${b} = ?`,
    correct: ans,
    options,
    explanation: `${a} ${op} ${b} sama dengan ${ans}.`,
  };
}
