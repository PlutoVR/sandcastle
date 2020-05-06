import { World, NaiveBroadphase, Plane, Body, Box, Vec3 } from "cannon";
import { Vector3 } from "three";
import { scene } from "../scene";


const TIMESTEP = 1 / 60;
const YGRAVITY = -9.82;


const physics = {};

let cannonWorld;

let rigidbodies = [];

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


(function ()
{
    // Init physics
    cannonWorld = new World();
    cannonWorld.broadphase = new NaiveBroadphase();
    cannonWorld.gravity.set(0, YGRAVITY, 0);
    cannonWorld.solver.iterations = 25;
    cannonWorld.solver.tolerance = 0.001;
    console.log("CannonJS world created");

    var groundShape = new Plane();
    var groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    cannonWorld.add(groundBody);
})();

physics.updatePhysics = () =>
{
    // sendDataToWorker();
    cannonWorld.step(TIMESTEP);
    if (rigidbodies.length < 1) return;
    rigidbodies.forEach((rb, i) =>
    {
        rb.position.copy(cannonWorld.bodies[i].position);
        rb.quaternion.copy(cannonWorld.bodies[i].quaternion);
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
    body.position.copy(mesh.position);
    body.addShape(shape);
    cannonWorld.addBody(body);
    rigidbodies.push(mesh);
}

export { physics }