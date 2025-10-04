import Phaser from 'phaser';

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }

  create() {
    const { width, height } = this.sys.game.canvas;

    // Top bar
    const barHeight = 56;
  const barColor = 0x23272f;
  const textColor = '#f5f6fa';

    this.add.rectangle(width / 2, barHeight / 2, width, barHeight, barColor, 1).setOrigin(0.5);
    this.add.text(width / 2, barHeight / 2, 'TheGames', { fontSize: '24px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);


    // Welcome message
    this.add.text(width / 2, barHeight + 48, 'Select a game!', {
      fontSize: '32px',
      color: textColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // List of games (currently only one)
    const games = [
      { name: '🔢ClickNumber', scene: 'ClickNumberScene', description: 'Tap the matching number!' }
    ];

    games.forEach((game, idx) => {
      const y = barHeight + 120 + idx * 100;
      // Modern card/button look (dark theme only)
      const btn = this.add.rectangle(width / 2, y, 280, 70, 0x23272f, 1)
        .setStrokeStyle(3, 0xf5f6fa)
        .setInteractive({ useHandCursor: true });
      this.add.text(width / 2, y - 12, game.name, { fontSize: '28px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
      this.add.text(width / 2, y + 18, game.description, { fontSize: '16px', color: textColor }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        this.scene.start(game.scene);
      });
    });
  }
}
