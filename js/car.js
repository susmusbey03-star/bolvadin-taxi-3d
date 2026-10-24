export class TaxiCar {
  constructor(THREE, config) {
    this.THREE = THREE;
    this.config = config;
    this.group = new THREE.Group();

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.25,
      roughness: 0.5
    });

    this.windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x9bd1ff,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8
    });

    this.chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.9,
      roughness: 0.2
    });

    this.lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfef3c7,
      emissiveIntensity: 0.8
    });

    this.stopMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.8
    });

    this.wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.2,
      roughness: 0.8
    });

    this.speed = 0;
    this.steer = 0;
    this.wheelSpin = 0;
    this.buildTaxi();
  }

  buildTaxi() {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.0, 2.0),
      this.bodyMaterial
    );
    body.position.y = 1.2;
    this.group.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.85, 1.72),
      this.bodyMaterial
    );
    cabin.position.set(0.4, 1.95, 0);
    this.group.add(cabin);

    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.55, 1.6),
      this.windowMaterial
    );
    windshield.position.set(1.18, 1.9, 0);
    windshield.rotation.z = -0.36;
    this.group.add(windshield);

    const rearWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 1.6),
      this.windowMaterial
    );
    rearWindow.position.set(-0.9, 1.9, 0);
    rearWindow.rotation.z = 0.36;
    this.group.add(rearWindow);

    const grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.65, 1.15),
      this.chromeMaterial
    );
    grille.position.set(2.17, 1.25, 0);
    this.group.add(grille);

    const headlightLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.34),
      this.lightMaterial
    );
    headlightLeft.position.set(2.18, 1.2, 0.72);
    this.group.add(headlightLeft);

    const headlightRight = headlightLeft.clone();
    headlightRight.position.z = -0.72;
    this.group.add(headlightRight);

    const tailLightLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.34),
      this.stopMaterial
    );
    tailLightLeft.position.set(-2.18, 1.12, 0.72);
    this.group.add(tailLightLeft);

    const tailLightRight = tailLightLeft.clone();
    tailLightRight.position.z = -0.72;
    this.group.add(tailLightRight);

    const wheelGeometry = new THREE.CylinderGeometry(0.46, 0.46, 0.38, 18);
    const wheelPositions = [
      new THREE.Vector3(1.3, 0.46, 1.15),
      new THREE.Vector3(-1.3, 0.46, 1.15),
      new THREE.Vector3(1.3, 0.46, -1.15),
      new THREE.Vector3(-1.3, 0.46, -1.15)
    ];

    this.wheels = [];
    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, this.wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.copy(pos);
      this.group.add(wheel);
      this.wheels.push(wheel);
    });

    this.frontWheels = [this.wheels[0], this.wheels[2]];
    this.rearWheels = [this.wheels[1], this.wheels[3]];

    const doorLeft = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 0.08),
      this.bodyMaterial
    );
    doorLeft.position.set(0.2, 1.28, 1.04);
    this.group.add(doorLeft);

    const doorRight = doorLeft.clone();
    doorRight.position.z = -1.04;
    this.group.add(doorRight);

    this.group.rotation.order = 'YXZ';
  }

  reset() {
    this.group.position.set(0, 0.2, 0);
    this.group.rotation.y = Math.PI * 0.35;
    this.speed = 0;
    this.steer = 0;
    this.wheelSpin = 0;
  }

  update(dt, controls, buildings, worldSize) {
    const forwardInput = controls.accelerate ? 1 : 0;
    const reverseInput = controls.reverse ? 1 : 0;
    const brakeInput = controls.brake ? 1 : 0;
    const steerInput = (controls.left ? -1 : 0) + (controls.right ? 1 : 0);

    if (forwardInput > 0 && this.speed < this.config.maxForwardSpeed) {
      this.speed += this.config.acceleration * dt;
    }

    if (reverseInput > 0 && this.speed > -this.config.maxReverseSpeed) {
      this.speed -= this.config.acceleration * dt * 0.8;
    }

    if (forwardInput === 0 && this.speed > 0) {
      this.speed -= this.config.drag * dt;
    }

    if (reverseInput === 0 && this.speed < 0) {
      this.speed += this.config.drag * dt;
    }

    if (brakeInput > 0) {
      if (this.speed > 0) {
        this.speed -= this.config.brakeForce * dt;
      } else if (this.speed < 0) {
        this.speed += this.config.brakeForce * dt;
      }
    }

    this.speed = this.THREE.MathUtils.clamp(this.speed, -this.config.maxReverseSpeed, this.config.maxForwardSpeed);

    const turnFactor = Math.min(1, Math.abs(this.speed) / this.config.maxForwardSpeed);
    const desiredSteer = steerInput * (0.7 + turnFactor * 0.8);
    this.steer += (desiredSteer - this.steer) * dt * 6.5;

    const turnStrength = this.config.turnGrip * (0.85 + turnFactor * 1.1);
    this.group.rotation.y += this.steer * turnStrength * dt * (0.75 + turnFactor * 1.6);

    const moveX = Math.sin(this.group.rotation.y) * this.speed * dt;
    const moveZ = Math.cos(this.group.rotation.y) * this.speed * dt;
    const nextX = this.group.position.x + moveX;
    const nextZ = this.group.position.z + moveZ;

    let collision = false;
    for (const building of buildings) {
      const halfW = building.width * 0.5 + 1.4;
      const halfD = building.depth * 0.5 + 1.4;
      if (Math.abs(nextX - building.x) < halfW && Math.abs(nextZ - building.z) < halfD) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      this.group.position.x = this.THREE.MathUtils.clamp(nextX, -worldSize, worldSize);
      this.group.position.z = this.THREE.MathUtils.clamp(nextZ, -worldSize, worldSize);
    } else {
      this.speed *= -0.16;
    }

    this.group.position.y = 0.2 + Math.sin(performance.now() * 0.005) * 0.02;

    this.wheelSpin -= this.speed * dt * 1.8;
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += this.wheelSpin * 0.12;
    });

    this.frontWheels.forEach((wheel) => {
      wheel.rotation.y = this.steer * 0.7;
    });
  }

  getSpeedKmh() {
    return Math.round(Math.abs(this.speed) * 4.2);
  }
}
