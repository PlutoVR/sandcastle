/* TODO:
- PADDLES ( & RESTART WITH BUTTON PRESS)
- PLACEHOLDER CUBE, PLACEMENT LOGIC & SESSION INIT
- NETWORKED PONGCUBE & BALL


****
WHEN CORE IS WORKING:
- TEST IN THE SOCIAL PLACES
- RESPONSIVE DESIGN: PHONE
- RESPONSIVE DESIGN: MAGIC LEAP

****
STATE:
status: "placement"
status: "game"
device: "xr-enabled" / "mobile" / "desktop"

score?
*/

import State from "../../engine/state"
import Physics from "../../engine/physics/physics"
import XRInput from "../../engine/xrinput"
import PeerConnection from '../../engine/networking/PeerConnection'
import Paddle from "./paddle"
import Ball from "./ball"
import
{
    Scene, Mesh, Object3D, Vector3,
    BoxBufferGeometry, PointLight,
    MathUtils, DoubleSide,
    MeshStandardMaterial, Quaternion as THREEQuaternion, Euler
} from "three";
import { Vec3, Quaternion } from "cannon";
import frictionlessMat from "./frictionlessMaterial"

const scene = new Scene();
const networking = new PeerConnection(scene);
Physics.enableDebugger(scene);

let paddle1, paddle2;

const createPongLevel = (position = new Vector3, rotation = new THREEQuaternion()) =>
{
    //////////
    // REMOVEOLDGAME(){}
    //////////

    console.log("creating pong level");
    createPongCube(position, rotation);

    paddle1 = new Paddle(true);
    scene.add(paddle1);
    networking.remoteSync.addLocalObject(paddle1, { type: "paddle" }, true);

    paddle2 = new Paddle(true);
    scene.add(paddle2);
    networking.remoteSync.addLocalObject(paddle2, { type: "paddle" }, true);


    // local paddle controller to control player's networked paddle
    // note: we're NOT directly hooking up any XRInput data to networking 

    const LocalPaddleController = new Object3D();

    LocalPaddleController.Update = () =>
    {
        paddle1.position.copy(XRInput.controllerGrips[ 0 ].position);
        paddle1.quaternion.copy(XRInput.controllerGrips[ 0 ].quaternion);

        paddle2.position.copy(XRInput.controllerGrips[ 1 ].position);
        paddle2.quaternion.copy(XRInput.controllerGrips[ 1 ].quaternion);
    }
    scene.add(LocalPaddleController)
}

const createPongCube = (position, quaternion) =>
{
    scene.pongCube = new Object3D();
    const light = new PointLight(0xffffff, 4);
    scene.pongCube.add(light);

    const geometry1 = new BoxBufferGeometry(4, 2, .02);
    const material = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });
    const sideLength = new Mesh(geometry1, material);

    const side1 = sideLength.clone();
    side1.name = "side1";
    side1.position.set(1, 0, 0);
    side1.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    scene.pongCube.add(side1);

    const side2 = sideLength.clone();
    side2.name = "side2";
    side2.position.set(-1, 0, 0);
    side2.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    scene.pongCube.add(side2);

    const top = sideLength.clone();
    top.name = "top";
    top.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    top.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    top.position.y -= 1;
    scene.pongCube.add(top);

    const bottom = sideLength.clone();
    bottom.name = "bottom";
    bottom.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    bottom.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    bottom.position.y += 1;
    scene.pongCube.add(bottom);

    scene.pongCube.name = "Pong Cube";

    scene.pongCube.position.copy(position);
    scene.pongCube.quaternion.copy(quaternion);

    scene.pongCube.updateMatrixWorld();
    scene.updateMatrixWorld();

    // transfer sceneCube offset directly to children
    // necessary for RigidBody alignment
    //  since mesh parent offset isn't a factor
    scene.pongCube.children.forEach(e =>
    {
        var wPos = new Vector3();
        var wQua = new THREEQuaternion();
        var wSca = new Vector3();
        e.matrixWorld.decompose(wPos, wQua, wSca);
        e.position.copy(wPos);
        e.quaternion.copy(wQua);
        e.scale.copy(wSca);
    });
    scene.pongCube.position.copy(new Vector3());
    scene.pongCube.quaternion.copy(new Quaternion());
    scene.add(scene.pongCube);

    scene.pongCube.children.forEach(e =>
    {
        e.rb = Physics.addRigidBody(e, Physics.RigidBodyShape.Box, Physics.Body.STATIC, 0);
        if (e.rb != undefined) // not light, etc
        {
            e.rb.material = frictionlessMat;
        }
    });

    //addaball
    // "master" bug workaround
    setTimeout(() =>
    {
        console.log("ismaster? " + networking.remoteSync.master);
        if (networking.remoteSync.master == true)
        {

            const ball = new Ball(position, true);
            scene.pongCube.add(ball);
            networking.remoteSync.addLocalObject(ball, { type: "ball", position: position }, true);
        }
    }, 1);


}

scene.init = () =>
{
    createPongLevel(new Vector3(0.4, 0, 0), new THREEQuaternion().setFromEuler(new Euler(0, 0, 0)));
}

// on connection
networking.remoteSync.addEventListener("open", (e) =>
{
    scene.init();
});

// on add
networking.remoteSync.addEventListener('add', (destId, objectId, info) =>
{
    switch (info.type)
    {
        case 'ball':
            const ball = new Ball(info.position, false); // only add RB once to fake server-client physics model
            networking.remoteSync.addRemoteObject(destId, objectId, ball);
            scene.add(ball);
            break;

        case 'paddle':
            const p = new Paddle();
            networking.remoteSync.addRemoteObject(destId, objectId, p);
            scene.add(p);
            break;

        default:
            return;
    }
});

export { scene }