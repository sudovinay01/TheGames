import './style.css';

import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene.js';
import ClickNumberScene from './scenes/ClickNumberScene.js';
import { GAME_CONFIG } from './utils/gameUtils.js';

// Ensure the canvas is wrapped in a .game-container for aspect ratio control
let app = document.getElementById('app');
if (!app) {
  console.warn('#app not found, creating fallback');
  app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
}
const container = document.createElement('div');
container.className = 'game-container';
app.appendChild(container);

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#181a1b',
  parent: container,
  scene: [WelcomeScene, ClickNumberScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

try {
  new Phaser.Game(config);
} catch (err) {
  console.error('Failed to start Phaser', err);
}

