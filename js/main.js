const loadingOverlay = document.getElementById('loading-overlay');
const errorOverlay = document.getElementById('error-overlay');
const errorText = document.getElementById('error-text');
const hud = document.getElementById('hud');
const touchControls = document.getElementById('touch-controls');
const miniMap = document.getElementById('mini-map');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetCameraButton = document.getElementById('reset-camera-button');

const showError = (message) => {
  loadingOverlay.classList.add('hidden');
  errorOverlay.classList.remove('hidden');
  errorText.textContent = message;
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
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js');
    const { InputController } = await import('./controls.js');
    const { TaxiGame } = await import('./game.js');

    const input = new InputController();
    const game = new TaxiGame(THREE, document.getElementById('app'), input);
    game.init();

    bindUi(game, input);

    loadingOverlay.classList.add('hidden');
    hud.classList.remove('hidden');
    touchControls.classList.remove('hidden');
    miniMap.classList.remove('hidden');
    startButton.classList.add('hidden');

    window.__taxiGame = game;
  } catch (error) {
    console.error('Three.js veya oyun başlatılamadı:', error);
    showError('Three.js yüklenemedi. CDN erişimini kontrol edin veya ağ bağlantısını doğrulayın.');
  }
}

startButton.addEventListener('click', () => {
  initializeGame();
});

window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    // mobil cihazlarda otomatik başlatma yapılır; kullanıcı butonla da başlatabilir.
  }
  initializeGame();
});
