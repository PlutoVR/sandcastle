import State from "../../engine/state";
import Physics from "../../engine/physics/physics";
import frictionlessMat from "./frictionlessMaterial";
import {
  Object3D,
  PointLight,
  BoxBufferGeometry,
  MeshStandardMaterial,
  DoubleSide,
  MathUtils,
  Mesh,
  Vector3,
  Quaternion as THREEQuaternion,
  PositionalAudio,
  AudioLoader,
  ShaderMaterial,
} from "three";
import { Quaternion } from "cannon";
import { Camera } from "../../engine/engine";

const vs = require("./assets/shaders/vs_defaultVertex.glsl");
const fs_goal = require("./assets/shaders/fs_goal.glsl");

const crashAudioFile = require("./assets/audio/hitgoal.ogg");

class Level extends Object3D {
  constructor(posRot, params) {
    super(params);
    const light = new PointLight(0xffffff, 4);
    this.add(light);

    const geometry1 = new BoxBufferGeometry(4, 2, 0.02);
    const material = new MeshStandardMaterial({
      color: 0x222222,
      wireframe: false,
      side: DoubleSide,
    });
    const sideLength = new Mesh(geometry1, material);

    const side1 = sideLength.clone();
    side1.name = "side1";
    side1.position.set(1, 0, 0);
    side1.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    this.add(side1);

    const side2 = sideLength.clone();
    side2.name = "side2";
    side2.position.set(-1, 0, 0);
    side2.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    this.add(side2);

    const top = sideLength.clone();
    top.name = "top";
    top.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    top.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    top.position.y -= 1;
    this.add(top);

    const bottom = sideLength.clone();
    bottom.name = "bottom";
    bottom.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    bottom.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    bottom.position.y += 1;
    this.add(bottom);

    const uniforms = { time: { value: 0.0 } };
    const goalGeo = new BoxBufferGeometry(4, 4, 0.002, 2, 2);
    const goalMat = new ShaderMaterial({
      uniforms,
      vertexShader: vs,
      fragmentShader: fs_goal,
      transparent: true,
    });

    const goal = new Mesh(goalGeo, goalMat);
    goal.name = "goal";
    goal.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    goal.position.z = 3;

    const startTime = Date.now();
    goal.Update = () => {
      if (goalMat.uniforms == undefined) return;
      goalMat.uniforms.time.value = (6 * (Date.now() - startTime)) / 1000;
    };
    this.add(goal);

    const goal2 = goal.clone();
    goal2.position.z = -3;
    this.add(goal2);

    this.name = "levelInstance";
    this.position.copy(posRot.position);
    this.rotation.copy(posRot.rotation);

    this.updateMatrixWorld();

    // transfer sceneCube offset directly to children
    // necessary for RigidBody alignment
    //  since mesh parent offset isn't a factor
    this.children.forEach(e => {
      var wPos = new Vector3();
      var wQua = new THREEQuaternion();
      var wSca = new Vector3();
      e.matrixWorld.decompose(wPos, wQua, wSca);
      e.position.copy(wPos);
      e.quaternion.copy(wQua);
      e.scale.copy(wSca);
    });
    this.position.copy(new Vector3());
    this.quaternion.copy(new Quaternion());

    //audio
    const levelRef = this;
    this.crashAudio = new PositionalAudio(Camera.audioListener);
    this.audioLoader = new AudioLoader();
    this.audioLoader.load(crashAudioFile, function (buffer) {
      levelRef.crashAudio.setBuffer(buffer);
      levelRef.crashAudio.setRefDistance(20);
    });

    this.children.forEach(e => {
      e.rb = Physics.addRigidBody(
        e,
        Physics.RigidBodyShape.Box,
        Physics.Body.STATIC,
        0
      );
      if (e.rb != undefined) {
        // not light, etc
        e.rb.material = frictionlessMat;
      }

      // game logic
      if (e.name == "goal") {
        e.rb.addEventListener("collide", this.endGame.bind(this));
      }
    });
  }

  endGame() {
    State.eventHandler.dispatchEvent("gameover");
    console.log(this);
    if (this.crashAudio == undefined) return;
    if (this.crashAudio.isPlaying) this.crashAudio.stop();
    this.crashAudio.play();
  }
}

export default Level;
