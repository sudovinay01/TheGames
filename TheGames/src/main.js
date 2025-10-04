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

// Development-only style probe: logs computed styles and watches for runtime
// mutations that change inline styles or inject style nodes. Useful to detect
// unexpected runtime margins (eg. margin-top: 107px) reported on mobile.
function installStyleProbe() {
  if (window.__STYLE_PROBE__) return;
  window.__STYLE_PROBE__ = true;

  function sample() {
    const els = {
      html: document.documentElement,
      body: document.body,
      app: document.getElementById('app'),
      container: document.querySelector('.game-container'),
      canvas: document.querySelector('canvas'),
    };

    console.group('STYLE_PROBE');
    for (const k in els) {
      const el = els[k];
      if (!el) {
        console.log(k, '— missing');
        continue;
      }
      try {
        const cs = getComputedStyle(el);
        console.log(k, {
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom,
          paddingTop: cs.paddingTop,
          top: cs.top,
          position: cs.position,
          height: cs.height,
          transform: cs.transform,
          inlineStyle: el.getAttribute('style'),
        });
      } catch (err) {
        console.error('STYLE_PROBE error reading', k, err);
      }
    }
    console.groupEnd();
  }

  // Run a few samples shortly after load and a bit later to catch SPA mutations
  window.addEventListener('load', () => setTimeout(sample, 150));
  setTimeout(sample, 600);
  setTimeout(sample, 3000);

  // Watch for attribute/style mutations and added/removed nodes in head/body/app
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      try {
        if (m.type === 'attributes' && m.attributeName === 'style') {
          console.log('STYLE_PROBE: style attribute changed on', m.target, m.target.getAttribute('style'));
        } else if (m.type === 'childList') {
          if (m.addedNodes && m.addedNodes.length) {
            m.addedNodes.forEach(n => console.log('STYLE_PROBE: node added', n));
          }
          if (m.removedNodes && m.removedNodes.length) {
            m.removedNodes.forEach(n => console.log('STYLE_PROBE: node removed', n));
          }
        }
      } catch (err) {
        console.error('STYLE_PROBE mutation handler error', err);
      }
    }
  });

  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style'], subtree: true });
  obs.observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true });
  const head = document.head || document.documentElement;
  obs.observe(head, { childList: true, subtree: true });
  const appEl = document.getElementById('app') || document.documentElement;
  obs.observe(appEl, { childList: true, subtree: true });

  window.__STYLE_PROBE_OBS = obs;
  console.log('STYLE_PROBE installed — watch the console for computed styles and mutation logs.');
}

installStyleProbe();

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#181a1b',
  parent: container,
  scene: [WelcomeScene, ClickNumberScene],
  scale: {
    mode: Phaser.Scale.FIT,
    // Center only horizontally so the container's top alignment is preserved
    // on small screens. CENTER_BOTH causes Phaser to set inline `margin-top`
    // on the canvas to vertically center it inside the parent which created
    // the reported 107px top gap on mobile.
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
};

try {
  new Phaser.Game(config);
} catch (err) {
  console.error('Failed to start Phaser', err);
}

