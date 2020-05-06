// import * as CANNON from "cannon";

// // let cannonWorld;
// const TIMESTEP = 1 / 60;
// const YGRAVITY = 0;

// let shape, body;

// shape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
// body = new CANNON.Body({ mass: 1 });
// body.position.set(0, 1, -3);
// body.addShape(shape);
// body.angularVelocity.set(0, 10, 0);
// body.angularDamping = 0.05;




// function addBody(mesh) 
// {
//     const shape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
//     const body = new CANNON.Body({ mass: 1 });
//     body.position.set(mesh.position);
//     body.addShape(shape);
//     cannonWorld.addBody(body);
// }

// onmessage = function (e)
// {
//     if (cannonWorld == null) return;


//     cannonWorld.bodies.forEach(e =>
//     {
//         console.log(e);
//     });
    // var positions = body.position;
    // var rotations = body.quaternion;
    // this.postMessage({ positions: positions, quaternions: rotations });
// }