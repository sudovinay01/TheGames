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

// temporary debugging instrumentation removed

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

// --- Service worker registration (production) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('Service worker registered:', reg.scope);
    }).catch((err) => console.warn('SW registration failed:', err));
  });
}

// --- PWA install prompt handling ---
let deferredPrompt = null;
const installButton = document.getElementById('pwa-install-button');
const installModal = document.getElementById('pwa-install-modal');
const installNow = document.getElementById('pwa-install-now');
const installLater = document.getElementById('pwa-install-later');
const installInstructions = document.getElementById('pwa-install-instructions');
const nativeStatus = document.getElementById('pwa-native-status');

// Rich on-screen debug panel (status, force prompt, last choice)
let pwaDebug = document.getElementById('pwa-debug');
if (!pwaDebug) {
  pwaDebug = document.createElement('div');
  pwaDebug.id = 'pwa-debug';
  pwaDebug.style.cssText = 'position:fixed;left:12px;top:12px;z-index:99999;padding:10px;border-radius:10px;background:rgba(0,0,0,0.65);color:#fff;font-size:13px;font-family:monospace;min-width:220px;';
  pwaDebug.innerHTML = `
    <div id="pwa-debug-status">PWA: init</div>
    <div style="margin-top:6px;display:flex;gap:6px;align-items:center;">
      <button id="pwa-force-prompt" type="button" style="flex:1;padding:6px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#fff;cursor:pointer">Force prompt</button>
      <div id="pwa-last-choice" style="font-size:12px;opacity:0.9">last: -</div>
    </div>
  `;
  document.body.appendChild(pwaDebug);
}

const pwaDebugStatus = document.getElementById('pwa-debug-status');
const pwaForceBtn = document.getElementById('pwa-force-prompt');
const pwaLastChoice = document.getElementById('pwa-last-choice');

function updateDebug(text) {
  if (pwaDebugStatus) pwaDebugStatus.textContent = 'PWA: ' + text;
  console.log('[PWA DEBUG]', text);
}

if (pwaForceBtn) {
  pwaForceBtn.addEventListener('click', async () => {
    console.log('Force prompt clicked. deferredPrompt=', !!deferredPrompt);
    updateDebug('Force prompt clicked — deferredPrompt=' + (!!deferredPrompt));
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log('Force prompt userChoice:', choice);
        if (pwaLastChoice) pwaLastChoice.textContent = 'last: ' + (choice.outcome || 'unknown');
        updateDebug('userChoice: ' + (choice.outcome || 'unknown'));
      } catch (err) {
        console.warn('Force prompt error', err);
        updateDebug('force prompt error');
      }
      deferredPrompt = null;
    } else {
      updateDebug('no deferredPrompt available');
    }
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  deferredPrompt = e;
  if (nativeStatus) nativeStatus.textContent = 'Native prompt: available';
  updateDebug('beforeinstallprompt fired — native prompt available');
  // Show our custom prompt UI on small screens; also make the floating button visible
  if (installModal) {
    installModal.style.display = 'flex';
    installModal.setAttribute('aria-hidden', 'false');
  }
  if (installButton) installButton.style.display = 'block';
});

// On load, if no beforeinstallprompt fired within a few seconds, show unavailable
setTimeout(() => {
  if (!deferredPrompt) {
    if (nativeStatus) nativeStatus.textContent = 'Native prompt: not available';
    updateDebug('beforeinstallprompt not fired (deferredPrompt null)');
  }
}, 2000);

if (installButton) {
  installButton.addEventListener('click', async () => {
    // If we have a deferred native prompt, trigger it. Otherwise show modal.
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('User choice:', choice);
      installButton.style.display = 'none';
      deferredPrompt = null;
    } else if (installModal) {
      // Fallback: show our modal to explain how to install (iOS)
      installModal.style.display = 'flex';
      installModal.setAttribute('aria-hidden', 'false');
      // Show iOS-specific instructions if needed
      if (/iP(hone|od|ad)/.test(navigator.userAgent) && !navigator.standalone) {
        installInstructions.style.display = 'block';
        installInstructions.innerHTML = 'Tap the Share button (▤) then "Add to Home Screen" to install the app.';
      }
    }
  });
}

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  if (installButton) installButton.style.display = 'none';
  if (installModal) {
    installModal.style.display = 'none';
    installModal.setAttribute('aria-hidden', 'true');
  }
});

// Hook modal buttons
if (installNow) {
  installNow.addEventListener('click', async () => {
    console.log('Install (modal) clicked. deferredPrompt present?', !!deferredPrompt);
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log('User choice from modal:', choice);
      } catch (err) {
        console.warn('Error prompting install:', err);
      }
      if (installModal) {
        installModal.style.display = 'none';
        installModal.setAttribute('aria-hidden', 'true');
      }
      deferredPrompt = null;
    } else {
      // No native prompt available; show platform-specific instructions (iOS/Android)
      if (installInstructions) {
        installInstructions.style.display = 'block';
        if (/iP(hone|od|ad)/.test(navigator.userAgent) && !window.navigator.standalone) {
          installInstructions.innerHTML = 'Tap the Share button (▤) then "Add to Home Screen" to install the app.';
        } else {
          installInstructions.innerHTML = 'If your browser supports installing PWAs, look for "Install" or "Add to Home screen" in the browser menu. Otherwise you can add this page to your home screen manually.';
        }
      }
      // Keep the modal open so users can read instructions
    }
  });
}

// Extra delegated handler on the modal to catch clicks in case button handlers didn't attach
if (installModal) {
  installModal.addEventListener('click', (ev) => {
    const target = ev.target;
    if (target && target.id === 'pwa-install-now') {
      console.log('Delegated: Install now clicked');
      installNow.click();
    }
    if (target && target.id === 'pwa-install-later') {
      installLater.click();
    }
  });
}

if (installLater) {
  installLater.addEventListener('click', () => {
    if (installModal) {
      installModal.style.display = 'none';
      installModal.setAttribute('aria-hidden', 'true');
    }
  });
}

// Close modal when clicking the overlay (outside the dialog) or pressing Escape
if (installModal) {
  installModal.addEventListener('click', (ev) => {
    if (ev.target === installModal) {
      installModal.style.display = 'none';
      installModal.setAttribute('aria-hidden', 'true');
    }
  });
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && installModal.getAttribute('aria-hidden') === 'false') {
      installModal.style.display = 'none';
      installModal.setAttribute('aria-hidden', 'true');
    }
  });
}

