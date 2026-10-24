import { GAME_CONFIG } from './config.js';
import { TaxiCar } from './car.js';
import { ChaseCamera } from './camera.js';

export class TaxiGame {
  constructor(THREE, container, input) {
    this.THREE = THREE;
    this.container = container;
    this.input = input;
    this.config = GAME_CONFIG;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x88b9ff);
    this.scene.fog = new THREE.Fog(0x88b9ff, 30, 180);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 4, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.buildings = [];
    this.money = 500;
    this.currentMission = 'Yolcu bekleniyor';
    this.paused = false;

    this.hud = {
      speed: document.getElementById('speed-value'),
      money: document.getElementById('money-value'),
      mission: document.getElementById('mission-name')
    };
  }

  async init() {
    this.buildEnvironment();
    this.addLights();
    this.setupWindowResize();

    this.taxi = new TaxiCar(this.THREE, this.config.taxi);
    this.scene.add(this.taxi.group);
    this.taxi.reset();

    this.chaseCamera = new ChaseCamera(this.THREE, this.camera, this.config.camera);

    this.updateHud();
    this.animate();
  }

  buildEnvironment() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      new THREE.MeshStandardMaterial({ color: 0x6ea85f, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3138,
      roughness: 0.9,
      metalness: 0.1
    });

    const roadX = new THREE.Mesh(new THREE.BoxGeometry(160, 0.1, 12), roadMaterial);
    roadX.position.set(0, 0.05, 0);
    roadX.receiveShadow = true;
    this.scene.add(roadX);

    const roadZ = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 160), roadMaterial);
    roadZ.position.set(0, 0.05, 0);
    roadZ.receiveShadow = true;
    this.scene.add(roadZ);

    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: 0xb9c4c0,
      roughness: 0.95
    });

    const sidewalk1 = new THREE.Mesh(new THREE.BoxGeometry(160, 0.12, 2.5), sidewalkMaterial);
    sidewalk1.position.set(0, 0.08, 7.8);
    this.scene.add(sidewalk1);

    const sidewalk2 = sidewalk1.clone();
    sidewalk2.position.z = -7.8;
    this.scene.add(sidewalk2);

    const sidewalk3 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.12, 160), sidewalkMaterial);
    sidewalk3.position.set(7.8, 0.08, 0);
    this.scene.add(sidewalk3);

    const sidewalk4 = sidewalk3.clone();
    sidewalk4.position.x = -7.8;
    this.scene.add(sidewalk4);

    for (let i = -70; i <= 70; i += 12) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.02, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc })
      );
      stripe.position.set(i, 0.12, 0);
      this.scene.add(stripe);
    }

    for (let i = -70; i <= 70; i += 12) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.02, 4.5),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc })
      );
      stripe.position.set(0, 0.12, i);
      this.scene.add(stripe);
    }

    const buildingDefinitions = [
      { x: -28, z: -30, w: 14, d: 12, h: 18, color: 0xd1d5db },
      { x: 32, z: -28, w: 16, d: 12, h: 22, color: 0xe2e8f0 },
      { x: -32, z: 28, w: 18, d: 14, h: 19, color: 0xcbd5e1 },
      { x: 34, z: 28, w: 14, d: 14, h: 17, color: 0xf1f5f9 },
      { x: -58, z: 0, w: 18, d: 12, h: 15, color: 0xe5e7eb },
      { x: 56, z: -6, w: 16, d: 12, h: 16, color: 0xdfe7f3 },
      { x: 0, z: -56, w: 14, d: 12, h: 18, color: 0xc7d2fe },
      { x: 0, z: 56, w: 14, d: 12, h: 19, color: 0xdbf4ff },
      { x: -66, z: -45, w: 12, d: 10, h: 12, color: 0xcbd5e1 },
      { x: 64, z: 48, w: 12, d: 10, h: 12, color: 0xddd6fe },
      { x: -68, z: 48, w: 13, d: 8, h: 10, color: 0xe2e8f0 }
    ];

    buildingDefinitions.forEach((spec) => {
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(spec.w, spec.h, spec.d),
        new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.8 })
      );
      building.position.set(spec.x, spec.h / 2, spec.z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      this.buildings.push({
        x: spec.x,
        z: spec.z,
        width: spec.w,
        depth: spec.d,
        height: spec.h
      });
    });

    for (let x = -60; x <= 60; x += 14) {
      for (let z = -60; z <= 60; z += 16) {
        if (Math.abs(x) < 18 && Math.abs(z) < 18) continue;

        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x7c4f1d })
        );
        trunk.position.set(x, 0.6, z);
        trunk.castShadow = true;
        this.scene.add(trunk);

        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(0.9, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x3a8f43 })
        );
        crown.position.set(x, 1.9, z);
        crown.castShadow = true;
        this.scene.add(crown);
      }
    }

    for (let x = -50; x <= 50; x += 22) {
      const lamp = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 3.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      pole.position.y = 1.8;
      lamp.add(pole);

      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.08, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      arm.position.set(0.36, 3.5, 0);
      lamp.add(arm);

      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xfef3c7,
          emissive: 0xfacc15,
          emissiveIntensity: 0.7
        })
      );
      bulb.position.set(0.72, 3.48, 0);
      lamp.add(bulb);

      lamp.position.set(x, 0, 8.8);
      this.scene.add(lamp);

      const lamp2 = lamp.clone();
      lamp2.position.z = -8.8;
      this.scene.add(lamp2);
    }

    const exitRoad = new THREE.Mesh(new THREE.BoxGeometry(32, 0.07, 10), roadMaterial);
    exitRoad.position.set(0, 0.06, 76);
    this.scene.add(exitRoad);
  }

  addLights() {
    const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x365c3b, 1.2);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(25, 38, 18);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    this.scene.add(dir);
  }

  setupWindowResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.033);

    if (!this.paused && this.taxi) {
      const controls = this.input.getState();
      this.taxi.update(dt, controls, this.buildings, this.config.worldSize);
      this.chaseCamera.update(dt, this.taxi.group);
      this.updateHud();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateHud() {
    if (!this.taxi) return;

    this.hud.speed.textContent = String(this.taxi.getSpeedKmh());
    this.hud.money.textContent = String(this.money);
    this.hud.mission.textContent = this.currentMission;
  }

  togglePause() {
    this.paused = !this.paused;
  }
}
