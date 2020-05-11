import { World, NaiveBroadphase, Plane, Body, Box, Vec3 } from "cannon";

import { Vector3 } from "three";
import { controller1, controller2 } from './xrinput';

// import * as THREE from "three";
// const CannonDebugRenderer = require("cannon/tools/threejs/CannonDebugRenderer")(THREE)
// import { scene } from "../scene";

const TIMESTEP = 1 / 60;
const YGRAVITY = -5;


const physics = { rigidbodies: new Array() }

let controller1RB, controller2RB;

// console.log(THREE);
// console.log(CannonDebugRenderer);


// TODO: FIGURE OUT IF WEBWORKER IS DOABLE
// const physicsSolver = new PhysicsSolver();
// physicsSolver.postMessage = physicsSolver.webkitPostMessage || physicsSolver.postMessage;

// const sendDataToWorker = () => 
// {
//     physicsSolver.postMessage({
//         // N: N,
//     });
// }

// physicsSolver.addEventListener('message', worker =>
// {
//     scene.children.forEach(child =>
//     {
//         if (child.physics)
//         {
//             child.position.copy(worker.data.positions);
//             child.quaternion.copy(worker.data.quaternions);
//         }
//     });
// });

physics.addControllerPhysics = () =>
{
    controller1RB = new Body({
        mass: 0,
        type: Body.KINEMATIC,
    });
    controller1RB.name = "Controller 1";
    controller1RB.collisionResponse = 1;
    // controller1RB.addEventListener("collide", function (e) { console.log("controller 1 collided!"); });
    controller1RB.addShape(new Box(new Vec3(.2, .2, .2)));
    physics.cannonWorld.add(controller1RB);

    controller2RB = new Body({
        mass: 0,
        type: Body.KINEMATIC,
    });
    controller2RB.name = "Controller 2";
    controller2RB.collisionResponse = 1;
    // controller2RB.addEventListener("collide", function (e) { console.log("controller 2 collided!"); });
    controller2RB.addShape(new Box(new Vec3(.2, .2, .2)));
    physics.cannonWorld.add(controller2RB);

    //init elsewhere to avoid false collisions
    controller2RB.position.copy(new Vec3(0, 100, 0));
    controller1RB.position.copy(new Vec3(0, 100, 0));
}

(function ()
{
    // Init physics
    physics.cannonWorld = new World();
    physics.cannonWorld.broadphase = new NaiveBroadphase();
    physics.cannonWorld.gravity.set(0, YGRAVITY, 0);
    physics.cannonWorld.solver.iterations = 12; //50
    physics.cannonWorld.solver.tolerance = 0.00001;
    console.log("CannonJS world created");


    //Plane. TODO: RELO TO SCENE!
    const groundShape = new Plane();
    const groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    physics.cannonWorld.add(groundBody);

    // controllers. Move this.
    physics.addControllerPhysics();

})();

document.addEventListener('keydown', (e) =>
{
    // controller1.position.y += .1;
});


physics.updateControllers = () =>
{
    if (controller1.position.y != 0)
    {
        controller1RB.position.copy(controller1.position);
        controller2RB.position.copy(controller2.position);
    }
}

physics.updatePhysics = () =>
{
    // sendDataToWorker();
    physics.cannonWorld.step(TIMESTEP);
    if (physics.rigidbodies.length < 1) return;

    physics.updateControllers();

    physics.rigidbodies.forEach((rb, i) =>
    {
        rb.position.copy(physics.cannonWorld.bodies[i + 3].position);
        rb.quaternion.copy(physics.cannonWorld.bodies[i + 3].quaternion);
    });

}

physics.addBody = (mesh) => 
{
    mesh.geometry.computeBoundingBox();
    const bbSize = new Vector3();
    mesh.geometry.boundingBox.getSize(bbSize);
    bbSize.divideScalar(2);
    const shape = new Box(new Vec3(bbSize.x, bbSize.y, bbSize.z));
    const body = new Body({ mass: 1 });
    body.addShape(shape);
    body.position.copy(mesh.position);
    physics.cannonWorld.addBody(body);
    physics.rigidbodies.push(mesh);
}



// physics.addTrigger = (mesh) => 
// {
//     // console.log("adding trigger to " + mesh.uuid);
//     // mesh.geometry.computeBoundingBox();
//     // const bbSize = new Vector3(.2, .2, .2);
//     // mesh.geometry.boundingBox.getSize(bbSize);
//     // bbSize.divideScalar(2);
//     const shape = new Box(new Vec3(.2, .2, .2));
//     const body = new Body({ mass: 0 });
//     body.position.copy(mesh.position);
//     body.addShape(shape);
//     body.collisionResponse = 0; // no impact on other bodys
//     body.addEventListener("collide", function (e) { console.log("collided"); });
//     physics.cannonWorld.addBody(body);

// }

export { physics }