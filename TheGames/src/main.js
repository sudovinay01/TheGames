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
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
};

try {
  new Phaser.Game(config);
} catch (err) {
  console.error('Failed to start Phaser', err);
}

// --- Service worker registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Resolve service worker URL at runtime using the page's base so it works even if
    // the build-time base wasn't applied as expected. This computes an absolute URL
    // for 'sw.js' relative to the current document base (e.g. https://.../TheGames/sw.js).
    try {
      const swUrl = new URL('sw.js', document.baseURI).href;
      navigator.serviceWorker.register(swUrl).then((reg) => {
        console.log('Service worker registered:', reg.scope);
      }).catch((err) => console.warn('SW registration failed:', err));
    } catch (err) {
      console.warn('SW registration failed (invalid URL):', err);
    }
  });
}

// --- PWA install prompt handling (cleaned) ---
let deferredPrompt = null;
const installButton = document.getElementById('pwa-install-button');
const installModal = document.getElementById('pwa-install-modal');
const installNow = document.getElementById('pwa-install-now');
const installLater = document.getElementById('pwa-install-later');
const installInstructions = document.getElementById('pwa-install-instructions');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the browser from showing the default mini-infobar
  e.preventDefault();
  deferredPrompt = e;
  // Show the custom modal and floating button (small screens)
  if (installModal) {
    installModal.style.display = 'flex';
    installModal.setAttribute('aria-hidden', 'false');
  }
  if (installButton) installButton.style.display = 'block';
});

// If the floating button is clicked, try the native prompt if available
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log('User choice:', choice);
      } catch (err) {
        console.warn('Error prompting install:', err);
      }
      installButton.style.display = 'none';
      deferredPrompt = null;
    } else if (installModal) {
      // Fallback: show modal with manual instructions (iOS)
      installModal.style.display = 'flex';
      installModal.setAttribute('aria-hidden', 'false');
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

// Modal buttons
if (installNow) {
  installNow.addEventListener('click', async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
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
      // No native prompt available; show platform-specific instructions
      if (installInstructions) {
        installInstructions.style.display = 'block';
        if (/iP(hone|od|ad)/.test(navigator.userAgent) && !window.navigator.standalone) {
          installInstructions.innerHTML = 'Tap the Share button (▤) then "Add to Home Screen" to install the app.';
        } else {
          installInstructions.innerHTML = 'If your browser supports installing PWAs, look for "Install" or "Add to Home screen" in the browser menu. Otherwise you can add this page to your home screen manually.';
        }
      }
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

// --- Service worker registration ---
const CACHE_NAME = 'thegames-static-v1';

// Resolve a path relative to the service worker script location
const baseUrl = new URL('.', self.location.href).href;

async function cacheIndexAndAssets(cache) {
  try {
    const indexUrl = new URL('index.html', baseUrl).href;
    const resp = await fetch(indexUrl, { cache: 'no-store' });
    if (!resp.ok) throw new Error('Failed to fetch index.html');
    const html = await resp.text();

    // collect asset URLs from index.html (src/href)
    const urls = new Set();
    urls.add(indexUrl); // cache index.html
    urls.add(new URL('sw.js', baseUrl).href); // keep SW available

    // regex find src/href values (simple but effective for build output)
    const re = /(?:src|href)="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) {
      let u = m[1];
      // ignore external URLs
      if (/^https?:\/\//.test(u)) continue;
      // resolve relative to SW location (so '/TheGames/...' and 'assets/...' both work)
      const abs = new URL(u, baseUrl).href;
      urls.add(abs);
    }

    // convert to array and add to cache
    const list = Array.from(urls);
    await cache.addAll(list);
    return true;
  } catch (err) {
    console.warn('SW install: failed to cache index/assets', err);
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cacheIndexAndAssets(cache);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE_NAME ? Promise.resolve() : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      // Cache same-origin GET responses (best-effort)
      try { await cache.put(req, res.clone()); } catch (e) { /* ignore opaque/PUT errors */ }
      return res;
    } catch (err) {
      // On network failure, fall back to cached index.html relative to SW
      const index = await cache.match(new URL('index.html', baseUrl).href);
      return index || Response.error();
    }
  })());
});

