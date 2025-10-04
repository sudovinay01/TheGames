
import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene.js';
import ClickNumberScene from './scenes/ClickNumberScene.js';

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  backgroundColor: '#f5f5f5',
  parent: 'app',
  scene: [WelcomeScene, ClickNumberScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
