import { World, NaiveBroadphase, Body, Plane, Box, Sphere, Cylinder, Vec3 } from "cannon";
import CannonDebugRenderer from "./util/CannonDebugRenderer";

import { Vector3, Quaternion } from "three";
import { controller1, controller2 } from './xrinput';
import { state } from "./state";

const TIMESTEP = 1 / 60;
const YGRAVITY = -5;

// Physics singleton
const Physics = {
    rigidbodies: new Array(),
    RigidBody: {
        Box: 1,
        Sphere: 2,
        Plane: 3,
        Cylinder: 4
    }
}

let controller1RB, controller2RB;


// TODO: FIGURE OUT IF WEBWORKER IS DOABLE
// const PhysicsSolver = new PhysicsSolver();
// PhysicsSolver.postMessage = PhysicsSolver.webkitPostMessage || PhysicsSolver.postMessage;

// const sendDataToWorker = () => 
// {
//     PhysicsSolver.postMessage({
//         // N: N,
//     });
// }

// PhysicsSolver.addEventListener('message', worker =>
// {
//     scene.children.forEach(child =>
//     {
//         if (child.Physics)
//         {
//             child.position.copy(worker.data.positions);
//             child.quaternion.copy(worker.data.quaternions);
//         }
//     });
// });

Physics.addControllerPhysics = () =>
{
    controller1RB = new Body({
        mass: 0,
        type: Body.KINEMATIC,
    });
    controller1RB.name = "Controller 1";
    controller1RB.collisionResponse = 1;
    // controller1RB.addEventListener("collide", function (e) { console.log("controller 1 collided!"); });
    controller1RB.addShape(new Box(new Vec3(.2, .2, .2)));
    Physics.cannonWorld.add(controller1RB);
    Physics.rigidbodies.push(controller1RB);

    controller2RB = new Body({
        mass: 0,
        type: Body.KINEMATIC,
    });
    controller2RB.name = "Controller 2";
    controller2RB.collisionResponse = 1;
    // controller2RB.addEventListener("collide", function (e) { console.log("controller 2 collided!"); });
    controller2RB.addShape(new Box(new Vec3(.2, .2, .2)));
    Physics.cannonWorld.add(controller2RB);
    Physics.rigidbodies.push(controller2RB);

    //init elsewhere to avoid false collisions
    controller2RB.position.copy(new Vec3(0, 100, 0));
    controller1RB.position.copy(new Vec3(0, 100, 0));
}

Physics.enableDebugger = (scene) =>
{
    Physics.debugRenderer = new CannonDebugRenderer(scene, Physics.cannonWorld);
}

(function ()
{
    // Init Physics
    Physics.cannonWorld = new World();
    Physics.cannonWorld.broadphase = new NaiveBroadphase();
    Physics.cannonWorld.gravity.set(0, YGRAVITY, 0);
    Physics.cannonWorld.solver.iterations = 50; //50
    Physics.cannonWorld.solver.tolerance = 0.00001;
    console.log("CannonJS world created");


    //Plane. TODO: RELO TO SCENE!
    const groundShape = new Plane();
    const groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
    Physics.cannonWorld.add(groundBody);
    Physics.rigidbodies.push(groundBody);

    // controllers. Move this.
    Physics.addControllerPhysics();

})();

document.addEventListener('keydown', (e) =>
{
    // controller1.position.y += .1;
});


Physics.updateControllers = () =>
{
    if (controller1.position.y != 0)
    {
        controller1RB.position.copy(controller1.position);
        controller2RB.position.copy(controller2.position);
    }
}

Physics.updatePhysics = () =>
{
    // sendDataToWorker();

    if (Physics.rigidbodies.length < 1) return;

    // run sim
    Physics.cannonWorld.step(TIMESTEP);

    Physics.updateControllers();

    // sync w/scene objects
    Physics.cannonWorld.bodies.forEach((body, i) =>
    {
        if (Physics.cannonWorld.bodies[i].type == Body.KINEMATIC) return;
        Physics.rigidbodies[i].quaternion.copy(Physics.cannonWorld.bodies[i].quaternion);
        Physics.rigidbodies[i].position.copy(Physics.cannonWorld.bodies[i].position);
    });

    Physics.debugRenderer.update();
}

Physics.resetScene = () =>
{
    const bodies = Physics.cannonWorld.bodies;
    i = bodies.length;
    while (i--)
    {
        this.removeBody(bodies[i]);
    }
}

Physics.addBody = (mesh, rbShape) => 
{
    mesh.geometry.computeBoundingBox();
    const bbSize = new Vector3();
    mesh.geometry.boundingBox.getSize(bbSize);
    bbSize.divideScalar(2);

    let shape;

    switch (rbShape)
    {
        case Physics.RigidBody.Box:
            shape = new Box(new Vec3(bbSize.x, bbSize.y, bbSize.z));
            break;

        case Physics.RigidBody.Sphere:
            shape = new Sphere(Math.max(bbSize.x, bbSize.y, bbSize.z));
            break;

        case Physics.RigidBody.Plane:
            shape = new Plane();
            break;
        case Physics.RigidBody.Cylinder:
            //Cylinder ( radiusTop  radiusBottom  height  numSegments )
            const minSize = Math.min(bbSize.x, bbSize.y, bbSize.z);
            const maxSize = Math.max(bbSize.x, bbSize.y, bbSize.z) * 2;
            shape = new Cylinder(minSize, minSize, maxSize, 16);
            break;

        default:
            console.error("Physics.addBody: No matching rigidbody found! See Physics.RigidBody object for options")
            break;
    }

    const body = new Body({ mass: 1 });
    body.addShape(shape);

    body.position.copy(mesh.position);
    body.quaternion.copy(mesh.quaternion);

    // parent-agnostic approach, currently not working:
    // let _worldSpaceMeshPos = new Vector3(), _worldSpaceMeshRot = new Quaternion();
    // mesh.getWorldPosition(_worldSpaceMeshPos);
    // mesh.getWorldQuaternion(_worldSpaceMeshRot);
    // body.position.copy(_worldSpaceMeshPos);
    // body.quaternion.copy(_worldSpaceMeshRot);

    Physics.cannonWorld.addBody(body);
    Physics.rigidbodies.push(mesh);
}

export { Physics }