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
    const barHeight = 56;
  const barColor = 0x23272f;
  const textColor = '#f5f6fa';
  const circleColor = 0x23272f;
  const circleStroke = 0xf5f6fa;


    // Top bar background
    this.add.rectangle(width / 2, barHeight / 2, width, barHeight, barColor, 1).setOrigin(0.5);

    // Back button (top left with symbol)
    const backBtn = this.add.rectangle(32, barHeight / 2, 44, 44, circleColor, 1)
      .setStrokeStyle(2, circleStroke)
      .setInteractive({ useHandCursor: true });
    this.add.text(32, barHeight / 2, '←', { fontSize: '28px', color: textColor }).setOrigin(0.5);
    backBtn.on('pointerdown', () => {
      this.scene.start('WelcomeScene');
    });

    // Game name in top bar
    this.add.text(width / 2, barHeight / 2, 'ClickNumber', { fontSize: '22px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);


    // Score and lives below bar
    this.scoreText = this.add.text(20, barHeight + 8, `Score: ${this.score}`, { fontSize: '20px', color: textColor });
    this.livesText = this.add.text(width - 20, barHeight + 8, `Lives: ${this.lives}`, { fontSize: '20px', color: textColor }).setOrigin(1, 0);

    // Top section: target number
  this.targetNumber = Phaser.Math.Between(0, 21);
    this.numberText = this.add.text(width / 2, barHeight + 80, this.targetNumber, {
      fontSize: '64px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Bottom section: 3 circles
    this.createCircles();
    this.input.on('gameobjectdown', this.handleCircleClick, this);

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
    // Generate 3 unique numbers in range 0-21
    let nums = [];
    while (nums.length < 3) {
      let n = Phaser.Math.Between(0, 21);
      if (!nums.includes(n)) nums.push(n);
    }
    for (let i = 0; i < 3; i++) {
      const num = nums[i];
      this.circleNumbers.push(num);
      const circle = this.add.circle(startX + i * spacing, circleY, 50, circleColor, 1)
        .setStrokeStyle(4, circleStroke)
        .setInteractive();
      const text = this.add.text(circle.x, circle.y, num, { fontSize: '40px', color: textColor }).setOrigin(0.5);
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
    // Generate 3 unique numbers in range 0-21, at least one matches target
    let nums = [];
    // Place the target number in a random position
    const targetPos = Phaser.Math.Between(0, 2);
    for (let i = 0; i < 3; i++) {
      if (i === targetPos) {
        nums.push(this.targetNumber);
      } else {
        let n;
        do {
          n = Phaser.Math.Between(0, 21);
        } while (nums.includes(n) || n === this.targetNumber);
        nums.push(n);
      }
    }
    for (let i = 0; i < 3; i++) {
      this.circleNumbers[i] = nums[i];
      this.circles[i].number = nums[i];
      this.circles[i].textObj.setText(nums[i]);
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
