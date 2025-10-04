

import './style.css';




import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene.js';
import ClickNumberScene from './scenes/ClickNumberScene.js';


// Ensure the canvas is wrapped in a .game-container for aspect ratio control
const app = document.getElementById('app');
let container = document.createElement('div');
container.className = 'game-container';
app.appendChild(container);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  backgroundColor: '#181a1b',
  parent: container,
  scene: [WelcomeScene, ClickNumberScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
