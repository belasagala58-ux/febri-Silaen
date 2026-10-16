import { sound } from './audio';
import { Question } from './questions';
import {
  applyDamage,
  calculateScore,
  calculateStars,
  evaluateAnswer,
  getFeedbackMessage,
  GradeLevel,
} from './rules';

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  color: string;
  secondaryColor: string;
  emoji: string;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'kancil',
    name: 'Kancil Cerdik',
    title: 'Cepat & Banyak Akal',
    color: '#f97316',
    secondaryColor: '#ea580c',
    emoji: '🦌',
  },
  {
    id: 'garuda',
    name: 'Garuda Muda',
    title: 'Gagah & Cerdas',
    color: '#eab308',
    secondaryColor: '#ca8a04',
    emoji: '🦅',
  },
  {
    id: 'kucing',
    name: 'Kucing Juara',
    title: 'Lincah & Ceria',
    color: '#06b6d4',
    secondaryColor: '#0891b2',
    emoji: '🐱',
  },
];

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'star' | 'square';
}

export interface CollectibleStar {
  x: number;
  y: number;
  collected: boolean;
  pulsePhase: number;
}

export interface EngineCallbacks {
  onScoreUpdate: (score: number, combo: number) => void;
  onHpUpdate: (hp: number, maxHp: number) => void;
  onQuestionChange: (question: Question | null, index: number, total: number) => void;
  onAnswerResult: (isCorrect: boolean, feedback: { title: string; subtitle: string }, explanation: string) => void;
  onLevelComplete: (victory: boolean, stats: { score: number; stars: number; correct: number; total: number }) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: EngineCallbacks;

  // Running status
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Input state
  private keysHeld: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();

  // Character & gameplay
  public character: CharacterDef = CHARACTERS[0];
  public grade: GradeLevel = 'sd1-2';
  private questions: Question[] = [];
  private currentQuestionIdx: number = 0;
  
  // Game metrics
  public score: number = 0;
  public combo: number = 0;
  public maxCombo: number = 0;
  public hp: number = 3;
  public maxHp: number = 3;
  public correctAnswers: number = 0;
  public totalQuestions: number = 6;
  public questionTimer: number = 20; // seconds per question
  public maxQuestionTimer: number = 20;

  // Physics & World
  public player = {
    x: 120,
    y: 350,
    vx: 0,
    vy: 0,
    width: 52,
    height: 52,
    groundY: 350,
    isGrounded: true,
    squashX: 1,
    squashY: 1,
    facing: 1, // 1 right, -1 left
    walkCycle: 0,
    invincibleTimer: 0,
  };

  private gravity: number = 980;
  private jumpVelocity: number = -460;
  private moveSpeed: number = 240;
  private worldOffset: number = 0;

  // Feedback & Juice
  private cameraShake: number = 0;
  private hitstopTimer: number = 0;
  private feedbackBanner: { text: string; subtext: string; color: string; timer: number } | null = null;

  // Interactive Portals / Answer Balloons
  private answerPortals: {
    index: number;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    hovered: boolean;
    scale: number;
  }[] = [];

  // Particles
  private particles: Particle[] = [];
  private ambientStars: CollectibleStar[] = [];

  // Mouse / Touch
  private mousePos = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
    this.callbacks = callbacks;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);

    this.bindEvents();
    this.resizeCanvas();
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Check headless
    const isHeadless = typeof navigator !== 'undefined' && 
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));
    const effectiveDpr = isHeadless ? 1 : dpr;

    this.canvas.width = rect.width * effectiveDpr;
    this.canvas.height = rect.height * effectiveDpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(effectiveDpr, effectiveDpr);

    // Update player ground
    const viewH = rect.height;
    this.player.groundY = Math.max(200, viewH - 120);
    if (this.player.isGrounded) {
      this.player.y = this.player.groundY;
    }
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleCanvasClick);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('click', this.handleCanvasClick);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;
    const code = e.code;
    this.keysHeld.add(code);
    this.keysJustPressed.add(code);

    // Action keys
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      this.triggerJump();
    }
    // Number keys 1, 2, 3, 4 for answer selection
    if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(code)) {
      const idx = parseInt(code.replace('Digit', ''), 10) - 1;
      this.submitAnswer(idx);
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keysHeld.delete(e.code);
    // Variable jump cut
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && this.player.vy < 0) {
      this.player.vy *= 0.45;
    }
  }

  private handleBlur() {
    this.keysHeld.clear();
    this.keysJustPressed.clear();
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;

    // Check hover on answer portals
    for (const portal of this.answerPortals) {
      portal.hovered =
        this.mousePos.x >= portal.x &&
        this.mousePos.x <= portal.x + portal.width &&
        this.mousePos.y >= portal.y &&
        this.mousePos.y <= portal.y + portal.height;
    }
  }

  private handleCanvasClick() {
    // Check if clicked any answer portal
    for (const portal of this.answerPortals) {
      if (
        this.mousePos.x >= portal.x &&
        this.mousePos.x <= portal.x + portal.width &&
        this.mousePos.y >= portal.y &&
        this.mousePos.y <= portal.y + portal.height
      ) {
        sound.playClick();
        this.submitAnswer(portal.index);
        return;
      }
    }

    // Otherwise jump if clicked inside playing area
    this.triggerJump();
  }

  public triggerJump() {
    if (!this.isRunning || this.isPaused) return;
    if (this.player.isGrounded) {
      this.player.vy = this.jumpVelocity;
      this.player.isGrounded = false;
      this.player.squashX = 0.8;
      this.player.squashY = 1.25;
      sound.playJump();
      this.spawnDust(this.player.x + this.player.width / 2, this.player.groundY + this.player.height);
    }
  }

  public triggerMove(dir: number) {
    this.player.vx = dir * this.moveSpeed;
    if (dir !== 0) {
      this.player.facing = dir > 0 ? 1 : -1;
    }
  }

  public startLevel(character: CharacterDef, grade: GradeLevel, questions: Question[]) {
    this.character = character;
    this.grade = grade;
    this.questions = questions;
    this.totalQuestions = questions.length;
    this.currentQuestionIdx = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hp = 3;
    this.correctAnswers = 0;
    this.isPaused = false;
    this.isRunning = true;
    this.particles = [];
    this.cameraShake = 0;
    this.hitstopTimer = 0;

    // Reset player position
    const viewW = this.canvas.parentElement?.clientWidth || 800;
    const viewH = this.canvas.parentElement?.clientHeight || 600;
    this.player.groundY = Math.max(200, viewH - 120);
    this.player.x = 80;
    this.player.y = this.player.groundY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = true;

    this.spawnStars(viewW);
    this.loadQuestion(0);

    this.callbacks.onHpUpdate(this.hp, this.maxHp);
    this.callbacks.onScoreUpdate(this.score, this.combo);

    this.lastTime = performance.now();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private spawnStars(viewW: number) {
    this.ambientStars = [];
    for (let i = 0; i < 7; i++) {
      this.ambientStars.push({
        x: 180 + i * ((viewW - 240) / 7),
        y: this.player.groundY - 60 - Math.sin(i * 0.8) * 40,
        collected: false,
        pulsePhase: i * 0.5,
      });
    }
  }

  private loadQuestion(index: number) {
    if (index >= this.questions.length) {
      this.finishLevel(true);
      return;
    }

    this.currentQuestionIdx = index;
    const q = this.questions[index];
    this.questionTimer = this.maxQuestionTimer;
    this.callbacks.onQuestionChange(q, index + 1, this.totalQuestions);

    this.setupAnswerPortals(q);
  }

  private setupAnswerPortals(q: Question) {
    const viewW = this.canvas.parentElement?.clientWidth || 800;
    const count = q.options.length;
    this.answerPortals = [];

    // Position balloons/portals across the middle-top or lower playfield area
    const portalW = Math.min(220, (viewW - 40 - (count - 1) * 16) / count);
    const portalH = 72;
    const totalW = count * portalW + (count - 1) * 16;
    const startX = Math.max(16, (viewW - totalW) / 2);
    const portalY = Math.max(90, this.player.groundY - 140);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

    for (let i = 0; i < count; i++) {
      this.answerPortals.push({
        index: i,
        text: q.options[i],
        x: startX + i * (portalW + 16),
        y: portalY,
        width: portalW,
        height: portalH,
        color: colors[i % colors.length],
        hovered: false,
        scale: 1,
      });
    }
  }

  public submitAnswer(optionIndex: number) {
    if (!this.isRunning || this.isPaused) return;
    const currentQ = this.questions[this.currentQuestionIdx];
    if (!currentQ) return;
    if (optionIndex < 0 || optionIndex >= currentQ.options.length) return;

    const isCorrect = evaluateAnswer(optionIndex, currentQ.correctIndex);
    const feedback = getFeedbackMessage(isCorrect, this.combo + 1);

    if (isCorrect) {
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.correctAnswers += 1;

      // Speed bonus
      const speedBonus = 1.0 + (this.questionTimer / this.maxQuestionTimer) * 0.5;
      const pts = calculateScore(100, this.combo, speedBonus);
      this.score += pts;

      // Juice
      if (this.combo >= 3) {
        sound.playCombo();
      } else {
        sound.playCorrect();
      }

      this.triggerHitstop(0.06);
      this.spawnConfetti(
        this.answerPortals[optionIndex]?.x + this.answerPortals[optionIndex]?.width / 2 || this.player.x,
        this.answerPortals[optionIndex]?.y || this.player.y
      );

      this.feedbackBanner = {
        text: feedback.title,
        subtext: `+${pts} Poin! ` + feedback.subtitle,
        color: '#10b981',
        timer: 1.6,
      };

      this.callbacks.onScoreUpdate(this.score, this.combo);
      this.callbacks.onAnswerResult(true, feedback, currentQ.explanation);

      // Hero celebration hop
      this.player.vy = -300;
      this.player.squashY = 1.3;

      // Advance after short beat
      setTimeout(() => {
        if (this.isRunning && !this.isPaused) {
          this.loadQuestion(this.currentQuestionIdx + 1);
        }
      }, 1200);
    } else {
      // Wrong answer
      this.combo = 0;
      this.hp = applyDamage(this.hp, 1);
      sound.playWrong();

      // Camera shake & hit flash
      this.cameraShake = 16;
      this.player.invincibleTimer = 1.2;
      this.triggerHitstop(0.08);

      this.feedbackBanner = {
        text: feedback.title,
        subtext: currentQ.explanation,
        color: '#ef4444',
        timer: 2.2,
      };

      this.callbacks.onScoreUpdate(this.score, this.combo);
      this.callbacks.onHpUpdate(this.hp, this.maxHp);
      this.callbacks.onAnswerResult(false, feedback, currentQ.explanation);

      if (this.hp <= 0) {
        setTimeout(() => {
          this.finishLevel(false);
        }, 1000);
      } else {
        setTimeout(() => {
          if (this.isRunning && !this.isPaused) {
            this.loadQuestion(this.currentQuestionIdx + 1);
          }
        }, 2200);
      }
    }
  }

  private triggerHitstop(durationSec: number) {
    this.hitstopTimer = durationSec;
  }

  private finishLevel(victory: boolean) {
    this.isRunning = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const stars = calculateStars(this.correctAnswers, this.totalQuestions, this.hp / this.maxHp);
    
    if (victory) {
      sound.playVictory();
    } else {
      sound.playGameOver();
    }

    this.callbacks.onLevelComplete(victory, {
      score: this.score,
      stars,
      correct: this.correctAnswers,
      total: this.totalQuestions,
    });
  }

  private loop(now: number) {
    if (!this.isRunning) return;

    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze for heavy feedback
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.render();
      this.animFrameId = requestAnimationFrame(this.loop);
      return;
    }

    if (!this.isPaused) {
      this.update(dt);
    }

    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private update(dt: number) {
    // Process continuous held input
    let moveDir = 0;
    if (this.keysHeld.has('ArrowLeft') || this.keysHeld.has('KeyA')) {
      moveDir -= 1;
    }
    if (this.keysHeld.has('ArrowRight') || this.keysHeld.has('KeyD')) {
      moveDir += 1;
    }
    this.player.vx = moveDir * this.moveSpeed;
    if (moveDir !== 0) {
      this.player.facing = moveDir;
      this.player.walkCycle += dt * 10;
    } else {
      this.player.walkCycle = 0;
    }

    // Apply gravity
    this.player.vy += this.gravity * dt;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    // View boundaries
    const viewW = this.canvas.parentElement?.clientWidth || 800;
    this.player.x = Math.max(20, Math.min(viewW - this.player.width - 20, this.player.x));

    // Ground collision
    if (this.player.y >= this.player.groundY) {
      if (!this.player.isGrounded) {
        // Landing squash
        this.player.squashX = 1.25;
        this.player.squashY = 0.75;
        this.spawnDust(this.player.x + this.player.width / 2, this.player.groundY + this.player.height);
      }
      this.player.y = this.player.groundY;
      this.player.vy = 0;
      this.player.isGrounded = true;
    }

    // Squash & stretch recovery
    this.player.squashX += (1 - this.player.squashX) * 10 * dt;
    this.player.squashY += (1 - this.player.squashY) * 10 * dt;

    // Invincible timer
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer -= dt;
    }

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake -= this.cameraShake * 8 * dt;
      if (this.cameraShake < 0.1) this.cameraShake = 0;
    }

    // World parallax offset
    this.worldOffset += dt * 25;

    // Question timer
    if (this.questionTimer > 0 && this.feedbackBanner === null) {
      this.questionTimer -= dt;
      if (this.questionTimer <= 0) {
        this.questionTimer = 0;
        // Auto timeout handled gently
        this.submitAnswer(-1); // will count as wrong
      }
    }

    // Feedback banner timer
    if (this.feedbackBanner) {
      this.feedbackBanner.timer -= dt;
      if (this.feedbackBanner.timer <= 0) {
        this.feedbackBanner = null;
      }
    }

    // Collectible stars check
    for (const star of this.ambientStars) {
      star.pulsePhase += dt * 3;
      if (!star.collected) {
        const dx = (this.player.x + this.player.width / 2) - star.x;
        const dy = (this.player.y + this.player.height / 2) - star.y;
        if (Math.hypot(dx, dy) < 40) {
          star.collected = true;
          this.score += 15;
          sound.playCoin();
          this.callbacks.onScoreUpdate(this.score, this.combo);
          this.spawnSparkle(star.x, star.y, '#facc15');
        }
      }
    }

    // Answer portal pulse/hover animation
    for (const portal of this.answerPortals) {
      const targetScale = portal.hovered ? 1.05 : 1.0;
      portal.scale += (targetScale - portal.scale) * 12 * dt;

      // Check player collision with portal (jumping into it)
      if (
        this.player.x + this.player.width > portal.x &&
        this.player.x < portal.x + portal.width &&
        this.player.y + this.player.height > portal.y &&
        this.player.y < portal.y + portal.height
      ) {
        // Player touched/jumped into this portal!
        this.submitAnswer(portal.index);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt; // light particle gravity
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private render() {
    const w = this.canvas.parentElement?.clientWidth || 800;
    const h = this.canvas.parentElement?.clientHeight || 600;

    this.ctx.save();
    this.ctx.clearRect(0, 0, w, h);

    // Camera shake (trauma * trauma)
    if (this.cameraShake > 0) {
      const shakeAmt = (this.cameraShake * this.cameraShake) * 0.05;
      const offsetX = (Math.random() - 0.5) * shakeAmt;
      const offsetY = (Math.random() - 0.5) * shakeAmt;
      this.ctx.translate(offsetX, offsetY);
    }

    // 1. Sky & Nature Background Gradient
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#38bdf8'); // sky blue
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Distant Sun with gentle rays
    this.drawSun(w * 0.85, 70);

    // 3. Parallax Floating Clouds
    this.drawClouds(w, h);

    // 4. Parallax Rolling Hills (Layers)
    this.drawRollingHills(w, h);

    // 5. Ground & Road (Pulau Pintar)
    this.drawGround(w, h);

    // 6. Ambient Collectible Stars
    this.drawCollectibleStars();

    // 7. Answer Portals / Floating Question Balloons
    this.drawAnswerPortals();

    // 8. Particles
    this.drawParticles();

    // 9. Player Character
    this.drawPlayer();

    // 10. Central Educational Feedback Banner (if active)
    if (this.feedbackBanner) {
      this.drawFeedbackBanner(w, h);
    }

    this.ctx.restore();
  }

  private drawSun(x: number, y: number) {
    this.ctx.save();
    // Warm outer glow
    const glow = this.ctx.createRadialGradient(x, y, 10, x, y, 50);
    glow.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
    glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    this.ctx.fillStyle = glow;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 50, 0, Math.PI * 2);
    this.ctx.fill();

    // Sun core
    this.ctx.fillStyle = '#facc15';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 24, 0, Math.PI * 2);
    this.ctx.fill();

    // Cute face on sun
    this.ctx.fillStyle = '#ca8a04';
    this.ctx.beginPath();
    this.ctx.arc(x - 6, y - 3, 2.5, 0, Math.PI * 2);
    this.ctx.arc(x + 6, y - 3, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Smile
    this.ctx.strokeStyle = '#ca8a04';
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();
    this.ctx.arc(x, y + 2, 7, 0.2 * Math.PI, 0.8 * Math.PI);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawClouds(w: number, _h: number) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';

    const cloudLayers = [
      { speed: 0.2, y: 50, scale: 0.8 },
      { speed: 0.35, y: 110, scale: 1.1 },
      { speed: 0.15, y: 160, scale: 0.6 },
    ];

    for (const c of cloudLayers) {
      const cx = (w + 200 - ((this.worldOffset * c.speed * 40) % (w + 400))) - 200;
      this.drawPuffyCloud(cx, c.y, c.scale);
      this.drawPuffyCloud(cx + w * 0.6, c.y + 20, c.scale * 0.9);
    }
    this.ctx.restore();
  }

  private drawPuffyCloud(x: number, y: number, scale: number) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
    this.ctx.arc(20, -10, 24, 0, Math.PI * 2);
    this.ctx.arc(45, 0, 20, 0, Math.PI * 2);
    this.ctx.arc(22, 10, 18, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawRollingHills(w: number, _h: number) {
    this.ctx.save();
    const groundBase = this.player.groundY + this.player.height;

    // Distant soft blue-green hills
    this.ctx.fillStyle = '#86efac';
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundBase);
    for (let x = 0; x <= w; x += 30) {
      const y = groundBase - 90 + Math.sin((x + this.worldOffset * 10) * 0.005) * 35;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(w, groundBase);
    this.ctx.closePath();
    this.ctx.fill();

    // Midground vivid emerald hills
    this.ctx.fillStyle = '#4ade80';
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundBase);
    for (let x = 0; x <= w; x += 30) {
      const y = groundBase - 50 + Math.sin((x + this.worldOffset * 20) * 0.009 + 2) * 25;
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(w, groundBase);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawGround(w: number, h: number) {
    this.ctx.save();
    const groundY = this.player.groundY + this.player.height;

    // Grass topper
    this.ctx.fillStyle = '#22c55e';
    this.ctx.fillRect(0, groundY - 8, w, 14);

    // Warm earth / stone base
    const earthGrad = this.ctx.createLinearGradient(0, groundY, 0, h);
    earthGrad.addColorStop(0, '#d97706');
    earthGrad.addColorStop(1, '#b45309');
    this.ctx.fillStyle = earthGrad;
    this.ctx.fillRect(0, groundY + 6, w, h - groundY);

    // Cute decorative grass blades along the trail
    this.ctx.fillStyle = '#16a34a';
    for (let i = 0; i < w; i += 36) {
      const sway = Math.sin((this.worldOffset * 4 + i) * 0.1) * 3;
      this.ctx.beginPath();
      this.ctx.moveTo(i, groundY - 6);
      this.ctx.lineTo(i + 4 + sway, groundY - 18);
      this.ctx.lineTo(i + 8, groundY - 6);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private drawCollectibleStars() {
    this.ctx.save();
    for (const star of this.ambientStars) {
      if (star.collected) continue;
      const pulse = 1 + Math.sin(star.pulsePhase) * 0.15;
      const sy = star.y + Math.sin(star.pulsePhase) * 6;

      this.ctx.save();
      this.ctx.translate(star.x, sy);
      this.ctx.scale(pulse, pulse);

      // Star glow
      this.ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
      this.ctx.fill();

      // 5-point star
      this.ctx.fillStyle = '#facc15';
      this.ctx.strokeStyle = '#ca8a04';
      this.ctx.lineWidth = 2;
      this.drawStarPath(0, 0, 5, 12, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.restore();
    }
    this.ctx.restore();
  }

  private drawStarPath(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
  }

  private drawAnswerPortals() {
    this.ctx.save();
    for (const portal of this.answerPortals) {
      const cx = portal.x + portal.width / 2;
      const cy = portal.y + portal.height / 2;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.scale(portal.scale, portal.scale);

      // Gentle floating float
      const bob = Math.sin((this.worldOffset * 3 + portal.index * 1.5)) * 4;
      this.ctx.translate(0, bob);

      // Card shadow
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      this.roundRect(-portal.width / 2 + 2, -portal.height / 2 + 4, portal.width, portal.height, 16);
      this.ctx.fill();

      // Card body with colorful pill border
      this.ctx.fillStyle = '#ffffff';
      this.roundRect(-portal.width / 2, -portal.height / 2, portal.width, portal.height, 16);
      this.ctx.fill();

      this.ctx.strokeStyle = portal.hovered ? '#fbbf24' : portal.color;
      this.ctx.lineWidth = portal.hovered ? 4 : 3;
      this.roundRect(-portal.width / 2, -portal.height / 2, portal.width, portal.height, 16);
      this.ctx.stroke();

      // Option badge pill (1, 2, 3, 4 or A, B, C, D)
      const badgeLetter = String.fromCharCode(65 + portal.index);
      this.ctx.fillStyle = portal.color;
      this.ctx.beginPath();
      this.ctx.arc(-portal.width / 2 + 24, 0, 16, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 16px "Fredoka", cursive, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(badgeLetter, -portal.width / 2 + 24, 1);

      // Option Text
      this.ctx.fillStyle = '#1e293b';
      this.ctx.font = 'bold 16px "Nunito", sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';

      // Truncate if long
      let displayText = portal.text;
      const maxTextW = portal.width - 64;
      while (displayText.length > 3 && this.ctx.measureText(displayText).width > maxTextW) {
        displayText = displayText.slice(0, -2) + '…';
      }
      this.ctx.fillText(displayText, -portal.width / 2 + 48, 1);

      this.ctx.restore();
    }
    this.ctx.restore();
  }

  private drawPlayer() {
    this.ctx.save();
    const p = this.player;

    // Blink if invincible
    if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer * 10) % 2 === 0) {
      this.ctx.restore();
      return;
    }

    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    this.ctx.translate(cx, cy);
    this.ctx.scale(p.facing * p.squashX, p.squashY);

    // Dynamic walk bounce
    const walkBob = Math.sin(p.walkCycle) * 3;
    this.ctx.translate(0, walkBob);

    // Character shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, p.height / 2 - walkBob, p.width * 0.45, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = this.character.color;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.width * 0.45, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = this.character.secondaryColor;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Cute belly badge
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(4, 4, p.width * 0.24, 0, Math.PI * 2);
    this.ctx.fill();

    // Eyes
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(10, -4, 4.5, 0, Math.PI * 2);
    this.ctx.arc(-2, -4, 4.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Eye sparkle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(11, -5.5, 1.8, 0, Math.PI * 2);
    this.ctx.arc(-1, -5.5, 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Rosy cheeks
    this.ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(14, 2, 4, 0, Math.PI * 2);
    this.ctx.arc(-6, 2, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Friendly smile
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(4, 3, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    this.ctx.stroke();

    // Mascot features (Ears/Crown depending on character)
    if (this.character.id === 'kancil') {
      // Deer cute ears
      this.ctx.fillStyle = this.character.color;
      this.ctx.beginPath();
      this.ctx.ellipse(-14, -22, 6, 12, -0.4, 0, Math.PI * 2);
      this.ctx.ellipse(8, -24, 6, 12, 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    } else if (this.character.id === 'garuda') {
      // Little eagle feather crest
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -22);
      this.ctx.lineTo(8, -34);
      this.ctx.lineTo(14, -20);
      this.ctx.fill();
    } else if (this.character.id === 'kucing') {
      // Cat ears
      this.ctx.fillStyle = this.character.color;
      this.ctx.beginPath();
      this.ctx.moveTo(-16, -14);
      this.ctx.lineTo(-12, -28);
      this.ctx.lineTo(-2, -18);
      this.ctx.moveTo(6, -18);
      this.ctx.lineTo(16, -28);
      this.ctx.lineTo(20, -14);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private drawParticles() {
    this.ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;

      this.ctx.beginPath();
      if (p.shape === 'star') {
        this.drawStarPath(p.x, p.y, 5, p.size, p.size / 2);
      } else {
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawFeedbackBanner(w: number, h: number) {
    if (!this.feedbackBanner) return;
    this.ctx.save();

    const bannerW = Math.min(540, w - 40);
    const bannerH = 80;
    const bx = (w - bannerW) / 2;
    // Position cleanly below the top HUD card (which extends to ~120px)
    const by = Math.max(145, Math.min(240, h * 0.25));

    // Background shadow
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    this.roundRect(bx + 4, by + 5, bannerW, bannerH, 24);
    this.ctx.fill();

    // Solid white card
    this.ctx.fillStyle = '#ffffff';
    this.roundRect(bx, by, bannerW, bannerH, 24);
    this.ctx.fill();

    // Prominent status border
    this.ctx.strokeStyle = this.feedbackBanner.color;
    this.ctx.lineWidth = 4;
    this.roundRect(bx, by, bannerW, bannerH, 24);
    this.ctx.stroke();

    // Main congratulatory title
    this.ctx.fillStyle = this.feedbackBanner.color;
    this.ctx.font = 'bold 22px "Fredoka", cursive, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(this.feedbackBanner.text, bx + bannerW / 2, by + 12);

    // Subtitle explanation
    this.ctx.fillStyle = '#1e293b';
    this.ctx.font = 'bold 15px "Nunito", sans-serif';
    this.ctx.fillText(this.feedbackBanner.subtext, bx + bannerW / 2, by + 46);

    this.ctx.restore();
  }

  private spawnConfetti(x: number, y: number) {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5);
      const speed = 120 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 150,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
        shape: Math.random() > 0.4 ? 'star' : 'circle',
      });
    }
  }

  private spawnSparkle(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        shape: 'star',
      });
    }
  }

  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 30,
        color: 'rgba(255, 255, 255, 0.7)',
        size: 3 + Math.random() * 3,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        shape: 'circle',
      });
    }
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
  }
}
