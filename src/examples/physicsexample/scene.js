// A simple physics-based game we all know
// demonstrates basic RigidBody creation
// (Note the Physics.addControllerRigidBody method, as well)

import State from "../../engine/state";
import {
  Scene,
  Vector3,
  Group,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import Brick from "./brickcustomshader";
import Physics from "../../engine/physics/physics";
import XRInput from "../../engine/xrinput";

const scene = new Scene();

Physics.enableDebugger(scene);

// Ground Plane
const groundShape = new PlaneBufferGeometry(10, 10);
const planeMat = new MeshBasicMaterial({ color: 0x000000, wireframe: true });
const plane = new Mesh(groundShape, planeMat);
plane.quaternion.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
scene.add(plane);
Physics.addRigidBody(
  plane,
  Physics.RigidBodyShape.Plane,
  Physics.Body.STATIC,
  0
);

// once XR controllers are registered, add RigidBodies
State.eventHandler.addEventListener("inputsourceschange", () => {
  XRInput.controllerGrips.forEach(controller => {
    Physics.addControllerRigidBody(controller);
  });
});

// BLOCK TOWER
const tower = new Group();

for (let y = 0; y < 13; y++) {
  const level = new Group();
  for (let x = 0; x < 3; x++) {
    const brickPos = new Vector3((-1 + x) / 2 + x * 0.01, y / 1.9, 0);
    const brick = new Brick(brickPos, y % 5);
    level.add(brick);
  }
  if (y % 2 == 0) {
    level.rotateOnAxis(new Vector3(0, 1, 0), 1.5708);
  }
  tower.add(level);

  // 0 pos is more likely to clash w/viewer
  tower.position.set(0, 0, -0.5);
  scene.updateMatrixWorld();
  tower.children.forEach((level, x) => {
    level.children.forEach((brick, y) => {
      if (!(brick instanceof Mesh)) return;
      scene.attach(brick);

      Physics.addRigidBody(brick, Physics.RigidBodyShape.Box);
    });
  });
}

export { scene };
