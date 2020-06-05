/* TODO:
- PLACEHOLDER CUBE, PLACEMENT LOGIC & SESSION INIT

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
import State from "../../engine/state";

const scene = new Scene();
const networking = new PeerConnection(scene);
const hostBot = new HostBot(networking);
let ball;

//register custom States & events

State.eventHandler.registerEvent('gameover');
State.eventHandler.registerEvent('gameover');


Physics.enableDebugger(scene);

const createPongLevel = (position = new Vector3, rotation = new THREEQuaternion()) =>
{
    const level = new Level(position, rotation);
    scene.add(level);


    // PADDLES 

    const paddle1 = new Paddle(true);
    scene.add(paddle1);
    networking.remoteSync.addLocalObject(paddle1, { type: "paddle" }, true);

    const paddle2 = new Paddle(true);
    scene.add(paddle2);
    networking.remoteSync.addLocalObject(paddle2, { type: "paddle" }, true);


    // local paddle controller component to control player's networked paddle
    // note: we're NOT directly hooking up any XRInput data to networking 
    // only connecting the object impacted by it

    const LocalPaddleController = new Object3D();
    LocalPaddleController.Update = () =>
    {
        paddle1.position.copy(XRInput.controllerGrips[ 0 ].position);
        paddle1.quaternion.copy(XRInput.controllerGrips[ 0 ].quaternion);

        paddle2.position.copy(XRInput.controllerGrips[ 1 ].position);
        paddle2.quaternion.copy(XRInput.controllerGrips[ 1 ].quaternion);
    }
    scene.add(LocalPaddleController)


    // BALL

    // "ismaster" bug workaround
    setTimeout(() =>
    {
        console.log("ismaster? " + networking.remoteSync.master);
        if (networking.remoteSync.master == true)
        {

            ball = new Ball(position, true);
            ball.initPos = position;
            scene.add(ball);
            networking.remoteSync.addLocalObject(ball, { type: "ball", position: position }, true);
        }
    }, 1);
}

scene.init = () =>
{
    createPongLevel(new Vector3(0.4, 0, 0));
}

////////// CUSTOM EVENTS //////////

/// GAME STATE

State.eventHandler.addEventListener("gameover", (e) =>
{
    if (ball != undefined)
    {
        ball.reset();
    } else
    {
        console.error("can't reset; no ball found!");
    }
});

/// INPUT

XRInput.controllerGrips.forEach(ctrl =>
{
    ctrl.addEventListener("selectstart", e =>
    {
        if (ball != undefined)
        {
            ball.kickoff();
        } else
        {
            console.error("can't kickoff; no ball found!");
        }

    })
});

/// NETWORKING 

networking.remoteSync.addEventListener("open", (e) =>
{
    scene.init();
});

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

networking.remoteSync.addEventListener('remove', function (remotePeerId, objectId, object)
{
    if (object.parent !== null) object.parent.remove(object);
});

export { scene }