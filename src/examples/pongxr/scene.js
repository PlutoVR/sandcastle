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

import { Scene, Object3D, Vector3, Quaternion as THREEQuaternion } from "three";

import Physics from "../../engine/physics/physics"
import XRInput from "../../engine/xrinput"
import PeerConnection from '../../engine/networking/PeerConnection'

import Paddle from "./paddle"
import Ball from "./ball"
import Level from "./level"
import HostBot from "./hostbot"


const scene = new Scene();
const networking = new PeerConnection(scene);
const hostBot = new HostBot(networking);

Physics.enableDebugger(scene);

let paddle1, paddle2;

const createPongLevel = (position = new Vector3, rotation = new THREEQuaternion()) =>
{
    //////////
    // REMOVEOLDGAME(){}
    //////////

    // LEVEL

    const level = new Level(position, rotation);
    scene.add(level);


    // PADDLES 

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

    // Ball

    // "master" bug workaround
    setTimeout(() =>
    {
        console.log("ismaster? " + networking.remoteSync.master);
        if (networking.remoteSync.master == true)
        {

            const ball = new Ball(position, true);
            scene.add(ball);
            networking.remoteSync.addLocalObject(ball, { type: "ball", position: position }, true);
        }
    }, 1);
}

scene.init = () =>
{
    createPongLevel(new Vector3(0.4, 0, 0));
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