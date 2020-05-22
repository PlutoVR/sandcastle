import { World, NaiveBroadphase, Body, Plane, Box, Sphere, Cylinder, Vec3 } from "cannon";
import CannonDebugRenderer from "./util/CannonDebugRenderer";
import { Vector3 } from "three";
import { PeerConnection } from "./networking/PeerConnection"
import { state } from "./state";

const TIMESTEP = 1 / 60;
const YGRAVITY = -5;

// Physics singleton
const Physics = {
    rigidbodies: new Array(),
    controllerRigidbodies: new Array(),
    RigidBodyType: {
        Box: 1,
        Sphere: 2,
        Plane: 3,
        Cylinder: 4
    }
}

// Init Physics
Physics.cannonWorld = new World();

Physics.cannonWorld.broadphase = new NaiveBroadphase();
Physics.cannonWorld.gravity.set(0, YGRAVITY, 0);
Physics.cannonWorld.solver.iterations = 50; //50
Physics.cannonWorld.solver.tolerance = 0.00001;
console.log("CannonJS world created");


//Plane. TODO: RELO TO SCENE!
const groundShape = new Plane();
const groundBody = new Body({
    mass: 0
});
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
Physics.cannonWorld.add(groundBody);
Physics.rigidbodies.push(groundBody);


// controllers. Move this.
Physics.addControllerRigidBody = (controller) =>
{
    const _cRB = new Body({
        mass: 0,
        type: Body.KINEMATIC,
    });
    _cRB.name = "Controller " + Physics.controllerRigidbodies.length + " RigidBody";
    _cRB.collisionResponse = 1;
    _cRB.addEventListener("collide", function (e) { console.log("controller collided!"); });
    _cRB.addShape(new Sphere(0.075));
    Physics.cannonWorld.add(_cRB);
    Physics.controllerRigidbodies.push(_cRB);
    Physics.rigidbodies.push(_cRB);
    console.log(_cRB.name + " created");
}

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

Physics.enableDebugger = (scene) =>
{
    Physics.debugRenderer = new CannonDebugRenderer(scene, Physics.cannonWorld);
}

Physics.updateControllers = () =>
{
    // if (state.hasXRInput)
    // {
    // ctrlArr.forEach((ctrl, i) =>
    // {
    //     Physics.controllerRigidbodies[i].position.copy(ctrlArr[i].position);
    //     Physics.controllerRigidbodies[i].quaternion.copy(ctrlArr[i].quaternion);
    // });
    // }
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
        if (Physics.cannonWorld.bodies[ i ].type == Body.KINEMATIC) return;
        Physics.rigidbodies[ i ].quaternion.copy(Physics.cannonWorld.bodies[ i ].quaternion);
        Physics.rigidbodies[ i ].position.copy(Physics.cannonWorld.bodies[ i ].position);
    });

    if (Physics.debugRenderer != undefined) Physics.debugRenderer.update(state.debugPhysics);
}

Physics.resetScene = () =>
{
    const bodies = Physics.cannonWorld.bodies;
    let i = bodies.length;
    console.log(i);
    while (i--)
    {
        this.removeBody(bodies[ i ]);
    }
}

Physics.addBody = (mesh, rbShape, mass = 1) => 
{
    mesh.geometry.computeBoundingBox();
    const bbSize = new Vector3();
    mesh.geometry.boundingBox.getSize(bbSize);
    bbSize.divideScalar(2);

    let shape;

    switch (rbShape)
    {
        case Physics.RigidBodyType.Box:
            shape = new Box(new Vec3(bbSize.x, bbSize.y, bbSize.z));
            break;

        case Physics.RigidBodyType.Sphere:
            shape = new Sphere(Math.max(bbSize.x, bbSize.y, bbSize.z));
            break;

        case Physics.RigidBodyType.Plane:
            shape = new Plane();
            break;

        case Physics.RigidBodyType.Cylinder:
            const minSize = Math.min(bbSize.x, bbSize.y, bbSize.z);
            const maxSize = Math.max(bbSize.x, bbSize.y, bbSize.z) * 2;
            shape = new Cylinder(minSize, minSize, maxSize, 16);
            break;

        default:
            console.error("Physics.addBody: No matching rigidbody found! See Physics.RigidBody object for options")
            break;
    }

    const body = new Body({
        mass: mass
    });
    body.addShape(shape);
    body.position.copy(mesh.position);
    body.quaternion.copy(mesh.quaternion);
    Physics.cannonWorld.addBody(body);
    Physics.rigidbodies.push(mesh);
}

export { Physics }