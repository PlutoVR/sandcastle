import State from "../../engine/state";
import {
  SphereBufferGeometry,
  ShaderMaterial,
  PositionalAudio,
  AudioLoader,
  Mesh,
  PointLight,
} from "three";

import { Camera } from "../../engine/engine";
import Physics from "../../engine/physics/physics";
import frictionlessMat from "./frictionlessMaterial";

const hitAudioFile = require("./assets/audio/elecping.ogg");

const vs = require("./assets/shaders/vs_defaultVertex.glsl");
const fs_puddles = require("./assets/shaders/fs_puddles.glsl");

class Ball extends Mesh {
  constructor(position, addRigidBody, params) {
    super(position, addRigidBody, params);
    const geometry = new SphereBufferGeometry(0.2, 13, 13);
    const material = new ShaderMaterial({
      uniforms: { time: { value: 0.0 } },
      vertexShader: vs,
      fragmentShader: fs_puddles,
    });
    this.geometry = geometry;
    this.material = material;

    this.position.copy(position);
    this.name = "ball";
    this.initPos = position;

    // physics
    if (addRigidBody == true) {
      // console.log("adding RB to ballRef");
      this.rb = Physics.addRigidBody(
        this,
        Physics.RigidBodyShape.Sphere,
        Physics.Body.DYNAMIC,
        1
      );

      this.rb.material = frictionlessMat;

      // audio
      const ballRef = this;
      let hitAudio;
      hitAudio = new PositionalAudio(Camera.audioListener);
      const audioLoader = new AudioLoader();
      audioLoader.load(hitAudioFile, function (buffer) {
        hitAudio.setBuffer(buffer);
        hitAudio.setRefDistance(20);
        ballRef.rb.addEventListener("collide", function (e) {
          if (hitAudio.isPlaying) hitAudio.stop();
          hitAudio.play();
        });
      });

      if (hitAudio === undefined) console.error("no AudioListener found!");
    }

    // innerlight
    const bLight = new PointLight(0x6a0dad, 3);
    this.add(bLight);

    this.startTime = Date.now();
  }

  Update() {
    if (this.material.uniforms.time == undefined) return;
    this.material.uniforms.time.value =
      (6 * (Date.now() - this.startTime)) / 100;
  }

  reset() {
    Physics.resetRigidbody(this.rb);
    this.rb.position.copy(this.initPos);
  }

  kickoff() {
    this.rb.velocity.set(this.rnd(-2, 2), this.rnd(-2, 2), this.rnd(-2, 2));
  }

  rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default Ball;
