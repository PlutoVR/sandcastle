/*****
WHEN CORE IS WORKING:
- TEST IN THE SOCIAL PLACES
- RESPONSIVE DESIGN: PHONE
- RESPONSIVE DESIGN: MAGIC LEAP

*/

import { Scene, Object3D } from "three";
import XRInput from "../../engine/xrinput"
import PeerConnection from '../../engine/networking/PeerConnection'

import Paddle from "./paddle"
import Ball from "./ball"
import Level from "./level"
import PlacementCube from "./placementcube"
import HostBot from "../../engine/util/hostbot"
import State from "../../engine/state";
import Physics from "../../engine/physics/physics"


const scene = new Scene();
const networking = new PeerConnection(scene);
const hostBot = new HostBot(networking);
let ball, placementCube;

// Register custom States & events
State.isMaster = true; // assume until proven otherwise
State.eventHandler.registerEvent('gameover');
const GameState = { placement: 1, play: 2 }

Physics.enableDebugger(scene);

const createPongLevel = (placementCube) =>
{
    const targetPosition = placementCube.position;
    const targetRotation = placementCube.rotation;

    State.GameState = GameState.play;
    const curPosRot = { position: targetPosition, rotation: targetRotation }
    const level = new Level(curPosRot);
    scene.add(level);
    networking.remoteSync.addLocalObject(level, { type: "level", posRot: curPosRot }, true);

    // dumb h a c k for the other side 
    placementCube.scale.set(0, 0, 0);

    // local
    scene.remove(placementCube);
    // remote placement cube removal, not working curretly
    // networking.remoteSync.removeSharedObject(3);

    // BALL
    if (State.isMaster)
    {
        ball = new Ball(targetPosition, true);
        ball.initPos = targetPosition;
        scene.add(ball);
        networking.remoteSync.addLocalObject(ball, { type: "ball", position: targetPosition }, true);
    }
}

const initPlacement = () =>
{
    State.GameState = GameState.placement;

    // PLACEMENT CUBE
    placementCube = PlacementCube();
    scene.add(placementCube);
    networking.remoteSync.addSharedObject(placementCube, 3, true);

    // PADDLES 

    const paddle1 = new Paddle();
    scene.add(paddle1);
    networking.remoteSync.addLocalObject(paddle1, { type: "paddle" }, true);

    const paddle2 = new Paddle();
    scene.add(paddle2);
    networking.remoteSync.addLocalObject(paddle2, { type: "paddle" }, true);


    // local paddle controller component to control player's networked paddle
    // note: we're NOT directly hooking up any XRInput data to networking 
    // only connecting the object impacted by it
    const LocalPaddleController = new Object3D();
    LocalPaddleController.Update = () =>
    {
        if (XRInput.controllerGrips != null)
        {
            if (XRInput.controllerGrips[ 0 ] != undefined)
            {
                paddle1.position.copy(XRInput.controllerGrips[ 0 ].position);
                paddle1.quaternion.copy(XRInput.controllerGrips[ 0 ].quaternion);
            }
            if (XRInput.controllerGrips[ 1 ] != undefined)
            {
                paddle2.position.copy(XRInput.controllerGrips[ 1 ].position);
                paddle2.quaternion.copy(XRInput.controllerGrips[ 1 ].quaternion);
            }
        }
    }
    scene.add(LocalPaddleController)
}

scene.init = () =>
{
    initPlacement();
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
let doubleClick = false;

State.eventHandler.addEventListener("select", e =>
{
    switch (State.GameState)
    {
        case (GameState.placement):
            if (State.isMaster)
            {
                createPongLevel(placementCube);
            }
            break;

        case (GameState.play):
        default:
            if (!doubleClick)
            {
                doubleClick = true;
                setTimeout(function ()
                {
                    if (ball == undefined)
                    {
                        console.error("can't kickoff; no ball found!");
                        return;
                    }
                    ball.kickoff();
                    doubleClick = false;
                }, 200);
            }
            else
            {
                console.log("doubleclick");
                // TOOD: implement dclick reset
                // location.reload();
            }
            break;
    }
});


/// NETWORKING 

networking.remoteSync.addEventListener("open", (e) =>
{
    scene.init();
});

networking.remoteSync.addEventListener("connect", (e) =>
{
    // setTimeout due to weird isMaster bug
    setTimeout(function () 
    {
        State.isMaster = networking.remoteSync.master;
    }, 1);
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

        case 'level':

            const l = new Level(info.posRot);
            networking.remoteSync.addRemoteObject(destId, objectId, l);
            scene.add(l);
            break;

        case 'placementcube':
            const pc = PlacementCube();
            networking.remoteSync.addRemoteObject(destId, objectId, pc);
            scene.add(pc);
        default:
            return;
    }
});

networking.remoteSync.addEventListener('remove', (remotePeerId, objectId, object) =>
{
    console.log("removing");
    scene.remove(object);
    if (object.parent !== null) object.parent.remove(object);
});

export { scene }