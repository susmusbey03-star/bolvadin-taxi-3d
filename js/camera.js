export class ChaseCamera {
  constructor(THREE, camera, config) {
    this.THREE = THREE;
    this.camera = camera;
    this.config = config;
    this.desiredPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
  }

  update(dt, taxiGroup) {
    const yaw = taxiGroup.rotation.y;
    const offset = new THREE.Vector3(
      -Math.sin(yaw) * this.config.distance,
      this.config.height,
      -Math.cos(yaw) * this.config.distance
    );

    this.desiredPosition.copy(taxiGroup.position).add(offset);
    this.desiredPosition.y = Math.max(this.desiredPosition.y, 1.7);

    this.camera.position.lerp(this.desiredPosition, 1 - Math.exp(-dt * this.config.smooth));

    this.lookTarget.copy(taxiGroup.position);
    this.lookTarget.x += Math.sin(yaw) * 5;
    this.lookTarget.z += Math.cos(yaw) * 5;
    this.lookTarget.y += 1.2;

    this.camera.lookAt(this.lookTarget);
  }
}
