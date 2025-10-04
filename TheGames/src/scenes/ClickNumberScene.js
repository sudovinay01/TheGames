import Phaser from 'phaser';
import { GAME_CONFIG, uniqueRandomNumbers, loadHighScore, saveHighScore, SCENE_KEYS } from '../utils/gameUtils.js';

export default class ClickNumberScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CLICK_NUMBER);
    this.targetNumber = null;
    this.circleNumbers = [];
    this.score = 0;
    this.lives = 3;
    this.circles = [];
    this.numberText = null;
    this.scoreText = null;
    this.livesText = null;
    this.changeTimerEvent = null;
    this.highScore = 0;
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.canvas;
    const barHeight = GAME_CONFIG.BAR_HEIGHT;
    const barColor = 0x23272f;
    const textColor = '#f5f6fa';
    const circleColor = 0x23272f;
    const circleStroke = 0xf5f6fa;

    // Top bar background
    this.add.rectangle(width / 2, barHeight / 2, width, barHeight, barColor, 1)
      .setOrigin(0.5)
      .setDepth(0);

    // Back button
    const backX = barHeight / 2 + 10;
    const backBtn = this.add.rectangle(backX, barHeight / 2, 44, 44, circleColor, 0.8)
      .setOrigin(0.5)
      .setStrokeStyle(2, circleStroke)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);
    const backArrow = this.add.text(backX, barHeight / 2, '←', { fontSize: '28px', color: textColor })
      .setOrigin(0.5)
      .setDepth(11);

    this.input.enabled = true;

    const goBack = () => {
      this.scene.stop(SCENE_KEYS.CLICK_NUMBER);
      this.scene.start(SCENE_KEYS.WELCOME);
    };
    backBtn.on('pointerup', goBack);

    // Minimal pointer debug (can be enabled if needed)
    this.input.on('pointerdown', (pointer) => {
      // noop
    });

    // Game name in top bar
    this.add.text(width / 2, barHeight / 2, 'ClickNumber', { fontSize: '22px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);

    this.highScore = loadHighScore(GAME_CONFIG.STORAGE_KEY_CLICKNUMBER_HS);
    this.score = 0;
    this.lives = 3;

    // Score and lives below bar
    this.scoreText = this.add.text(20, barHeight + 8, `Score: ${this.score}`, { fontSize: '20px', color: textColor });
    this.livesText = this.add.text(width - 20, barHeight + 8, `Lives: ${this.lives}`, { fontSize: '20px', color: textColor }).setOrigin(1, 0);

    // target number
    this.targetNumber = Phaser.Math.Between(0, GAME_CONFIG.MAX_NUMBER);
    this.numberText = this.add.text(width / 2, barHeight + 80, this.targetNumber, {
      fontSize: '64px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Bottom section: circles
    this.createCircles();

    // Use Phaser time event
    this.changeTimerEvent = this.time.addEvent({
      delay: GAME_CONFIG.CHANGE_INTERVAL,
      callback: this.changeCircleNumbers,
      callbackScope: this,
      loop: true,
    });

    this.input.on('gameobjectdown', this.handleCircleClick, this);

    this.events.on('shutdown', this._cleanup, this);
    this.events.on('destroy', this._cleanup, this);
  }

  createCircles() {
    const { width, height } = this.sys.game.canvas;
    const circleColor = 0x23272f;
    const circleStroke = 0xf5f6fa;
    const textColor = '#f5f6fa';
    const circleY = height * 0.7;
    const spacing = 120;
    const startX = width / 2 - spacing;
    this.circles = [];
    this.circleNumbers = [];

    const nums = uniqueRandomNumbers(GAME_CONFIG.CIRCLE_COUNT, GAME_CONFIG.MAX_NUMBER, this.targetNumber);
    for (let i = 0; i < GAME_CONFIG.CIRCLE_COUNT; i++) {
      const num = nums[i];
      this.circleNumbers.push(num);
      const circle = this.add.circle(startX + i * spacing, circleY, 50, circleColor, 1)
        .setStrokeStyle(4, circleStroke)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(circle.x, circle.y, num, { fontSize: '40px', color: textColor }).setOrigin(0.5);
      circle.number = num;
      circle.textObj = text;
      this.circles.push(circle);
    }
  }

  changeCircleNumbers() {
    if (!this.circles || this.circles.length < GAME_CONFIG.CIRCLE_COUNT) return;
    const nums = uniqueRandomNumbers(GAME_CONFIG.CIRCLE_COUNT, GAME_CONFIG.MAX_NUMBER, this.targetNumber);
    for (let i = 0; i < nums.length; i++) {
      this.circleNumbers[i] = nums[i];
      const c = this.circles[i];
      if (c && c.textObj) {
        c.number = nums[i];
        c.textObj.setText(nums[i]);
      }
    }
  }

  handleCircleClick(pointer, gameObject) {
    const circle = gameObject;
    if (!circle || typeof circle.number !== 'number') return;

    if (circle.number === this.targetNumber) {
      this.score++;
      this.scoreText.setText(`Score: ${this.score}`);
      if (this.score > this.highScore) {
        this.highScore = this.score;
        saveHighScore(GAME_CONFIG.STORAGE_KEY_CLICKNUMBER_HS, this.highScore);
      }
      this.targetNumber = Phaser.Math.Between(0, GAME_CONFIG.MAX_NUMBER);
      this.numberText.setText(this.targetNumber);
      this.changeCircleNumbers();
    } else {
      this.lives--;
      this.livesText.setText(`Lives: ${this.lives}`);
      if (this.lives <= 0) this.scene.restart();
    }
  }

  _cleanup() {
    if (this.changeTimerEvent) {
      this.changeTimerEvent.remove(false);
      this.changeTimerEvent = null;
    }
    this.input.off('gameobjectdown', this.handleCircleClick, this);
    this.events.off('shutdown', this._cleanup, this);
    this.events.off('destroy', this._cleanup, this);
  }
}
