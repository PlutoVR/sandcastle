import { BoxBufferGeometry, ShaderMaterial, Mesh } from "three";
import Physics from "../../engine/physics/physics";
import { Vec3 } from "cannon";
const vs = require("./assets/shaders/vs_defaultVertex.glsl");
const fs_puddles = require("./assets/shaders/fs_puddles.glsl");

class Paddle extends Mesh {
  constructor(params) {
    super(params);
    const paddleGeo = new BoxBufferGeometry(0.25, 0.001, 0.25);
    const paddleMat = new ShaderMaterial({
      uniforms: { time: { value: 0.0 } },
      vertexShader: vs,
      fragmentShader: fs_puddles,
    });

    this.geometry = paddleGeo;
    this.material = paddleMat;
    this.name = "paddle";
    this.rb = Physics.addRigidBody(
      this,
      Physics.RigidBodyShape.Box,
      Physics.Body.KINEMATIC,
      0
    );

    this.curPos = new Vec3();

    this.startTime = Date.now();
  }

  Update() {
    this.rb.position.copy(this.position);
    this.rb.quaternion.copy(this.quaternion);

    // shader update
    if (this.material.uniforms.time == undefined) return;
    this.material.uniforms.time.value =
      (6 * (Date.now() - this.startTime)) / 500;
  }
}

export default Paddle;
