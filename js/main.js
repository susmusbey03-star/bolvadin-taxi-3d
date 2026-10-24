const loadingOverlay = document.getElementById('loading-overlay');
const errorOverlay = document.getElementById('error-overlay');
const errorText = document.getElementById('error-text');
const orientationOverlay = document.getElementById('orientation-overlay');
const hud = document.getElementById('hud');
const touchControls = document.getElementById('touch-controls');
const miniMap = document.getElementById('mini-map');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetCameraButton = document.getElementById('reset-camera-button');

let gameInstance = null;
let initStarted = false;

const showError = (message) => {
  loadingOverlay.classList.add('hidden');
  errorOverlay.classList.remove('hidden');
  errorText.textContent = message;
};

const refreshOrientationOverlay = () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  if (orientationOverlay) {
    orientationOverlay.classList.toggle('hidden', !isPortrait);
  }
};

const bindUi = (game, input) => {
  pauseButton.addEventListener('click', () => {
    game.togglePause();
    input.togglePause();
  });

  resetCameraButton.addEventListener('click', () => {
    if (game && game.taxi) {
      game.taxi.reset();
      game.camera.position.set(0, 4, 10);
    }
  });
};

async function initializeGame() {
  if (initStarted) return;
  initStarted = true;

  try {
    const { loadThree } = await import('./vendor/three-loader.js');
    const THREE = await loadThree();

    if (!THREE || !THREE.Scene || !THREE.WebGLRenderer) {
      throw new Error('Three.js kütüphanesi eksik API verdi. Modül yüklenmedi.');
    }

    const { InputController } = await import('./controls.js');
    const { TaxiGame } = await import('./game.js');

    const input = new InputController();
    const game = new TaxiGame(THREE, document.getElementById('app'), input);
    await game.init();
    gameInstance = game;

    bindUi(game, input);

    loadingOverlay.classList.add('hidden');
    hud.classList.remove('hidden');
    touchControls.classList.remove('hidden');
    miniMap.classList.remove('hidden');
    startButton.classList.add('hidden');

    window.__taxiGame = game;
  } catch (error) {
    console.error('Three.js veya oyun başlatılamadı:', error);
    const reason = error && error.message ? error.message : 'Bilinmeyen hata';
    showError(`Three.js yüklenemedi. Neden: ${reason}. Lütfen CDN erişimini kontrol edin veya ağ bağlantısını doğrulayın.`);
  }
}

startButton.addEventListener('click', () => {
  initializeGame();
});

window.addEventListener('resize', refreshOrientationOverlay);
window.addEventListener('orientationchange', refreshOrientationOverlay);
window.addEventListener('DOMContentLoaded', () => {
  refreshOrientationOverlay();
  initializeGame();
});
