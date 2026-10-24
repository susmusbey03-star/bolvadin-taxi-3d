const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
const FALLBACK_CDN = 'https://unpkg.com/three@0.160.1/build/three.module.js';
const LOCAL_THREE_URL = new URL('./three.module.js', import.meta.url).href;

async function safeImport(url) {
  const module = await import(url);
  return module.default || module;
}

export async function loadThree() {
  const candidates = [LOCAL_THREE_URL, THREE_CDN, FALLBACK_CDN];
  let lastError = null;

  for (const url of candidates) {
    try {
      const THREE = await safeImport(url);
      if (THREE && THREE.Scene && THREE.WebGLRenderer) {
        return THREE;
      }
      throw new Error('Three.js API beklenen yapıda gelmedi.');
    } catch (error) {
      lastError = error;
      console.warn(`Three.js import failed from ${url}:`, error);
    }
  }

  throw new Error(
    `Three.js yüklenemedi. Denenen kaynaklar: ${candidates.join(', ')}. Son hata: ${lastError ? lastError.message : 'bilinmeyen hata'}`
  );
}
