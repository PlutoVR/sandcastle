import {
  World,
  NaiveBroadphase,
  Body,
  Plane,
  Box,
  Sphere,
  Cylinder,
  Vec3,
} from "cannon";
import CannonDebugRenderer from "../util/debughelpers/cannondebugrenderer";
import { Vector3 } from "three";
import State from "../state";
import XRInput from "../../engine/xrinput";

const TIMESTEP = 1 / 120;
const YGRAVITY = -9.81;

// Physics singleton
const Physics = {
  rigidbodies: new Array(),
  controllerRigidbodies: new Array(),
  RigidBodyShape: {
    Box: 1,
    Sphere: 2,
    Plane: 3,
    Cylinder: 4,
  },
  Body: Body,
};

// Init Physics
Physics.cannonWorld = new World();

Physics.cannonWorld.broadphase = new NaiveBroadphase();
Physics.cannonWorld.gravity.set(0, YGRAVITY, 0);
Physics.cannonWorld.solver.iterations = 50; //50
Physics.cannonWorld.solver.tolerance = 0;

if (State.debugMode) console.log("CannonJS world created");

Physics.addControllerRigidBody = controller => {
  const _cRB = new Body({
    mass: 0,
    type: Body.KINEMATIC,
  });
  _cRB.name =
    "Controller " + Physics.controllerRigidbodies.length + " RigidBody";
  _cRB.collisionResponse = 1;
  // _cRB.addEventListener("collide", function (e) { console.log("controller collided!"); });
  _cRB.addShape(new Sphere(0.075));
  Physics.cannonWorld.add(_cRB);
  Physics.controllerRigidbodies.push(_cRB);
  Physics.rigidbodies.push(_cRB);
  if (State.debugMode) console.log(_cRB.name + " created");
};

Physics.enableDebugger = scene => {
  Physics.debugRenderer = new CannonDebugRenderer(scene, Physics.cannonWorld);
};

Physics.updateControllers = () => {
  if (
    XRInput.controllerGrips == null ||
    XRInput.controllerGrips.length == 0 ||
    Physics.controllerRigidbodies.length == 0
  )
    return;
  XRInput.controllerGrips.forEach((ctrl, i) => {
    Physics.controllerRigidbodies[i].position.copy(
      XRInput.controllerGrips[i].position
    );
    Physics.controllerRigidbodies[i].quaternion.copy(
      XRInput.controllerGrips[i].quaternion
    );
  });
};

Physics.Update = () => {
  // sendDataToWorker();
  if (Physics.rigidbodies.length < 1) return;

  // run sim
  Physics.cannonWorld.step(TIMESTEP);

  Physics.updateControllers();

  // sync w/scene objects
  Physics.cannonWorld.bodies.forEach((body, i) => {
    if (Physics.cannonWorld.bodies[i].type == Body.KINEMATIC) return;
    Physics.rigidbodies[i].quaternion.copy(body.quaternion);
    Physics.rigidbodies[i].position.copy(body.position);
  });

  if (Physics.debugRenderer != undefined)
    Physics.debugRenderer.update(State.debugMode);
};

Physics.resetScene = () => {
  const bodies = Physics.cannonWorld.bodies;
  let i = bodies.length;
  while (i--) {
    this.removeBody(bodies[i]);
  }
};

Physics.addRigidBody = (mesh, rbShape, type = Body.DYNAMIC, mass = 1) => {
  if (mesh.geometry == undefined) {
    if (State.debugMode)
      console.warn(
        "no mesh geometry found for " +
          mesh.type +
          ", aborting rigibdoy creation"
      );
    return;
  }

  mesh.geometry.computeBoundingBox();
  const bbSize = new Vector3();
  mesh.geometry.boundingBox.getSize(bbSize);
  bbSize.divideScalar(2);

  let shape;

  switch (rbShape) {
    case Physics.RigidBodyShape.Box:
      shape = new Box(new Vec3(bbSize.x, bbSize.y, bbSize.z));
      break;

    case Physics.RigidBodyShape.Sphere:
      shape = new Sphere(Math.max(bbSize.x, bbSize.y, bbSize.z));
      break;

    case Physics.RigidBodyShape.Plane:
      shape = new Plane();
      break;

    case Physics.RigidBodyShape.Cylinder:
      const minSize = Math.min(bbSize.x, bbSize.y, bbSize.z);
      const maxSize = Math.max(bbSize.x, bbSize.y, bbSize.z) * 2;
      shape = new Cylinder(minSize, minSize, maxSize, 16);
      break;

    default:
      console.error(
        "Physics.addBody: No matching rigidbody found! See Physics.RigidBody object for options"
      );
      break;
  }

  const body = new Body({
    mass: mass,
    type: type,
    allowSleep: true,
    sleepSpeedLimit: 1.0,
  });

  body.addShape(shape);
  body.position.copy(mesh.position);
  body.quaternion.copy(mesh.quaternion);
  Physics.cannonWorld.addBody(body);

  body.addEventListener("collide", function (e) {
    if (State.debugMode) console.log("body collided");
  });
  Physics.rigidbodies.push(mesh);
  return body;
};

// reset rigidbody completely

Physics.resetRigidbody = body => {
  // Position
  body.position.setZero();
  body.previousPosition.setZero();
  body.interpolatedPosition.setZero();
  body.initPosition.setZero();

  // orientation
  body.quaternion.set(0, 0, 0, 1);
  body.initQuaternion.set(0, 0, 0, 1);
  // body.previousQuaternion.set(0, 0, 0, 1);
  // body.interpolatedQuaternion.set(0, 0, 0, 1);

  // Velocity
  body.velocity.setZero();
  body.initVelocity.setZero();
  body.angularVelocity.setZero();
  body.initAngularVelocity.setZero();

  // Force
  body.force.setZero();
  body.torque.setZero();

  // Sleep state reset
  body.sleepState = 0;
  body.timeLastSleepy = 0;
  body._wakeUpAfterNarrowphase = false;
};

export default Physics;
