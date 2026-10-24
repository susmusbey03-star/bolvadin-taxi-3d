const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
const FALLBACK_CDN = 'https://unpkg.com/three@0.160.1/build/three.module.js';

export async function loadThree() {
  const candidates = [
    './vendor/three.module.js',
    THREE_CDN,
    FALLBACK_CDN
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const mod = await import(url);
      const api = mod.default || mod;
      if (api && api.Scene && api.WebGLRenderer) {
        return api;
      }
      throw new Error('Three.js module loaded but did not expose expected API.');
    } catch (error) {
      lastError = error;
      console.warn(`Three.js import failed from ${url}:`, error);
    }
  }

  throw new Error(
    `Three.js yüklenemedi. Denenen kaynaklar: ${candidates.join(', ')}. Son hata: ${lastError ? lastError.message : 'bilinmeyen hata'}`
  );
}
