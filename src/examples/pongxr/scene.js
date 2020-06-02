import State from "../../engine/state"
import { Vec3 } from "cannon";

import frictionlessMat from "./frictionlessMaterial"
import { Scene, SphereBufferGeometry, PositionalAudio, AudioLoader, BoxBufferGeometry, PointLight, ShaderMaterial, Mesh, MathUtils, DoubleSide, Vector3, MeshStandardMaterial, Object3D, MeshBasicMaterial } from "three";
import Physics from "../../engine/physics/physics"
import XRInput from "../../engine/xrinput"
import Ball from "./ball"
import PeerConnection from '../../engine/networking/PeerConnection'


const scene = new Scene();
const networking = new PeerConnection(scene);

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


const createPongLevel = (position = new Vector3(0, 0, 0), rotation) =>
{
    console.log("starting pong level");

    //////////
    // REMOVEOLDGAME(){}
    //////////
    createPongCube(position, rotation);
    // XRInput.controllerGrips.forEach(e => createPaddle(e, true));
    const paddle1 = createPaddle(XRInput.controllerGrips[ 0 ], true);
    const paddle2 = createPaddle(XRInput.controllerGrips[ 1 ], true);
    scene.add(paddle1);
    scene.add(paddle2);

    // won't be generating unique IDs
    // networking.remoteSync.addSharedObject(paddle1, true);
    // networking.remoteSync.addSharedObject(paddle2, true);

    networking.remoteSync.addLocalObject(paddle1, { type: "paddle" }, true);
    networking.remoteSync.addLocalObject(paddle2, { type: "paddle" }, true);


}

const createPaddle = (e, isLocal) =>
{
    console.log("creating paddles");
    const paddleGeo = new BoxBufferGeometry(.25, .25, .001);
    const paddleMat = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });
    const paddle = new Mesh(paddleGeo, paddleMat);


    // paddle.rb = Physics.addRigidBody(paddle, Physics.RigidBodyShape.Box, Physics.Body.KINEMATIC, 0);

    paddle.Update = () =>
    {
        if (isLocal)
        {
            // if (e == null) return;

            // paddle.rb.position.copy(Physics.convertPosition(e.position));
            // paddle.rb.quaternion.copy(e.quaternion);

            // console.log(paddle.rb.position);
            // console.log("reading controller RB");
        }
    }
    // networking.remoteSync.addLocalObject(paddle, { type: "paddle" }, true);
    if (isLocal)
    {
        e.add(paddle);
        // scene.add(e);
        return e;
    }
    else
    {
        // scene.add(paddle);
        return paddle;
    }

}


const createPongCube = (position, rotation) =>
{


    scene.pongCube = new Object3D();
    const light = new PointLight(0xffffff, 4);
    scene.pongCube.add(light);

    const geometry1 = new BoxBufferGeometry(4, 2, .02);
    const material = new MeshStandardMaterial({ color: 0x222222, wireframe: false, side: DoubleSide });

    const sideLength = new Mesh(geometry1, material);


    const side3 = sideLength.clone();
    side3.position.set(1, 0, 0);
    side3.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    scene.pongCube.add(side3);

    const side4 = sideLength.clone();
    side4.position.set(-1, 0, 0);
    side4.rotateOnAxis(new Vector3(0, 1, 0), MathUtils.degToRad(90));
    scene.pongCube.add(side4);

    const top = sideLength.clone();
    top.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    top.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    top.position.y -= 1;
    scene.pongCube.add(top);

    const bottom = sideLength.clone();
    bottom.rotateOnAxis(new Vector3(1, 0, 0), MathUtils.degToRad(90));
    bottom.rotateOnAxis(new Vector3(0, 0, 1), MathUtils.degToRad(90));
    bottom.position.y += 1;
    scene.pongCube.add(bottom);

    scene.updateMatrixWorld();
    scene.pongCube.children.forEach(e =>
    {
        e.rb = Physics.addRigidBody(e, Physics.RigidBodyShape.Box, Physics.Body.STATIC, 0);
        if (e.rb != undefined) { e.rb.material = frictionlessMat; }
    });

    scene.add(scene.pongCube);





    // networking.remoteSync.addSharedObject(ball, true);

    // offset all rigidbodies by starting position
    scene.pongCube.children.forEach(e =>
    {
        if (e.rb != undefined)
        {
            e.rb.position.vadd(Physics.convertPosition(position), e.rb.position);
        }
    });

}



scene.init = () =>
{
    Physics.enableDebugger(scene);

    createPongLevel(new Vector3(0, 0, 0));
}

State.eventHandler.addEventListener("peerconnected", (e) =>
{
    scene.init();

    // hack w/setTimeOut to solve isMaster bug
    setTimeout(() =>
    {
        console.log("ismaster? " + networking.remoteSync.master);
        if (networking.remoteSync.master == true)
        {

            const ball = new Ball(new Vec3(.5, 0, 0), true);
            scene.pongCube.add(ball);
            networking.remoteSync.addLocalObject(ball, { type: "ball" }, true);
        }
    }, 2000);
});

networking.remoteSync.addEventListener('add', onAdd);

function onAdd(destId, objectId, info)
{
    console.log(info);

    switch (info.type)
    {

        case 'ball':
            const ball = new Ball(new Vec3(.5, 0, 0), false);
            console.log("adding local ball from onAdd");
            networking.remoteSync.addRemoteObject(destId, objectId, ball);
            scene.pongCube.add(ball);
            break;

        case 'paddle':
            console.log("adding local paddle from onAdd");
            const p = createPaddle(null, false);
            networking.remoteSync.addRemoteObject(destId, objectId, p);
            scene.add(p);
            break;

        default:
            return;

    }

    // scene.add(mesh);



}


export { scene }
