import Phaser from 'phaser';

export default class ClickNumberScene extends Phaser.Scene {
  constructor() {
    super('ClickNumberScene');
    this.targetNumber = null;
    this.circleNumbers = [];
    this.score = 0;
    this.lives = 3;
    this.circles = [];
    this.numberText = null;
    this.scoreText = null;
    this.livesText = null;
    this.changeTimer = 0;
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.canvas;


    // Top bar background
    const barHeight = 56;
    this.add.rectangle(width / 2, barHeight / 2, width, barHeight, 0xf5f5f5, 1).setOrigin(0.5);

    // Back button (top left with symbol)
    const backBtn = this.add.rectangle(32, barHeight / 2, 44, 44, 0xffffff, 1)
      .setStrokeStyle(2, 0x222222)
      .setInteractive({ useHandCursor: true });
    this.add.text(32, barHeight / 2, '←', { fontSize: '28px', color: '#222' }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    // Game name in top bar
    this.add.text(width / 2, barHeight / 2, 'ClickNumber', { fontSize: '22px', color: '#222', fontStyle: 'bold' }).setOrigin(0.5);

    // Score and lives below bar
    this.scoreText = this.add.text(20, barHeight + 8, `Score: ${this.score}`, { fontSize: '20px', color: '#222' });
    this.livesText = this.add.text(width - 20, barHeight + 8, `Lives: ${this.lives}`, { fontSize: '20px', color: '#222' }).setOrigin(1, 0);

    // Top section: target number
    this.targetNumber = Phaser.Math.Between(1, 9);
    this.numberText = this.add.text(width / 2, barHeight + 80, this.targetNumber, {
      fontSize: '64px',
      color: '#222',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Bottom section: 3 circles
    this.createCircles();
    this.input.on('gameobjectdown', this.handleCircleClick, this);

  }

  createCircles() {
    const { width, height } = this.sys.game.canvas;
    const circleY = height * 0.7;
    const spacing = 120;
    const startX = width / 2 - spacing;
    this.circles = [];
    this.circleNumbers = [];
    for (let i = 0; i < 3; i++) {
      const num = Phaser.Math.Between(1, 9);
      this.circleNumbers.push(num);
      const circle = this.add.circle(startX + i * spacing, circleY, 50, 0xffffff, 1)
        .setStrokeStyle(4, 0x222222)
        .setInteractive();
      const text = this.add.text(circle.x, circle.y, num, { fontSize: '40px', color: '#222' }).setOrigin(0.5);
      circle.number = num;
      circle.textObj = text;
      this.circles.push(circle);
    }
  }

  update(time, delta) {
    this.changeTimer += delta;
    if (this.changeTimer > 700) {
      this.changeCircleNumbers();
      this.changeTimer = 0;
    }
  }

  changeCircleNumbers() {
    for (let i = 0; i < 3; i++) {
      let num = Phaser.Math.Between(1, 9);
      // Ensure at least one matches target
      if (i === 2 && !this.circleNumbers.includes(this.targetNumber)) {
        num = this.targetNumber;
      }
      this.circleNumbers[i] = num;
      this.circles[i].number = num;
      this.circles[i].textObj.setText(num);
    }
  }

  handleCircleClick(pointer, circle) {
    if (circle.number === this.targetNumber) {
      this.score++;
      this.scoreText.setText(`Score: ${this.score}`);
      this.targetNumber = Phaser.Math.Between(1, 9);
      this.numberText.setText(this.targetNumber);
    } else {
      this.lives--;
      this.livesText.setText(`Lives: ${this.lives}`);
      if (this.lives <= 0) {
        this.scene.restart();
      }
    }
  }
}
