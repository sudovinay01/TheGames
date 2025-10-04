import Phaser from 'phaser';

export default class WelcomeScene extends Phaser.Scene {
  constructor() {
    super('WelcomeScene');
  }

  create() {
    const { width, height } = this.sys.game.canvas;
    this.add.text(width / 2, height * 0.2, 'Welcome to TheGames!', {
      fontSize: '36px',
      color: '#222',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // List of games (currently only one)
    const games = [
      { name: 'ClickNumber', scene: 'ClickNumberScene', description: 'Tap the matching number!' }
    ];

    games.forEach((game, idx) => {
      const y = height * 0.4 + idx * 80;
      const btn = this.add.rectangle(width / 2, y, 260, 60, 0xffffff, 1)
        .setStrokeStyle(3, 0x222222)
        .setInteractive({ useHandCursor: true });
      this.add.text(width / 2, y, game.name, { fontSize: '28px', color: '#222' }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        this.scene.start(game.scene);
      });
    });
  }
}
