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

import { Scene, Clock, Object3D, Vector3, Quaternion as THREEQuaternion, Mesh, BoxBufferGeometry, Color, MeshBasicMaterial } from "three";

import XRInput from "../../engine/xrinput"
import PeerConnection from '../../engine/networking/PeerConnection'

import Paddle from "./paddle"
import Ball from "./ball"
import Level from "./level"
import HostBot from "../../engine/util/hostbot"
import State from "../../engine/state";
import { camera } from "../../engine/engine"

State.isMaster = true; // assume until proven otherwise

const scene = new Scene();
const c = new Clock();
const networking = new PeerConnection(scene);

const hostBot = new HostBot(networking);
let ball;
let placementCube, level;

// Register custom States & events

State.eventHandler.registerEvent('gameover');
const GameState = { placement: 1, play: 2 }


// Physics.enableDebugger(scene);

const createPongLevel = (placementCube) =>
{
    const targetPosition = placementCube.position;
    const targetRotation = placementCube.rotation;

    State.GameState = GameState.play;
    const curPosRot = { position: targetPosition, rotation: targetRotation }
    level = new Level(curPosRot);
    scene.add(level);
    networking.remoteSync.addLocalObject(level, { type: "level", posRot: curPosRot }, true);

    // dumb h a c k for the other side 
    placementCube.scale.set(0, 0, 0);
    console.log(placementCube);

    // not working
    networking.remoteSync.removeSharedObject(3);

    // local
    scene.remove(placementCube);


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
        paddle1.position.copy(XRInput.controllerGrips[ 0 ].position);
        paddle1.quaternion.copy(XRInput.controllerGrips[ 0 ].quaternion);

        paddle2.position.copy(XRInput.controllerGrips[ 1 ].position);
        paddle2.quaternion.copy(XRInput.controllerGrips[ 1 ].quaternion);
    }
    scene.add(LocalPaddleController)

    // console.log(State.isMaster);
    // BALL
    if (State.isMaster)
    {
        ball = new Ball(targetPosition, true);
        ball.initPos = targetPosition;
        scene.add(ball);
        networking.remoteSync.addLocalObject(ball, { type: "ball", position: targetPosition }, true);
    }
}

const PlacementCube = () =>
{
    // fix for world cam dir querying
    let forwardOffset = new Vector3();
    let CamForward = new Vector3();
    let empty = new Object3D();
    camera.add(empty);
    const placementCubeInstance = new Mesh(new BoxBufferGeometry(2, 2, 4, 8, 8, 16), new MeshBasicMaterial({ color: new Color("rgb(0, 255, 0)"), wireframe: true }));

    placementCubeInstance.Update = function ()
    {
        this.material.color.g = Math.cos(c.getElapsedTime() * 5) / 2 + .5;
        this.position.add(forwardOffset);

        if (State.isMaster && XRInput.XRinputSources.length > 0)
        {
            XRInput.XRinputSources.forEach((e, i) =>
            {
                if (Math.abs(e.gamepad.axes[ 2 ]) > 0.5) this.rotation.y += e.gamepad.axes[ 2 ] > 0 ? -.01 : .01;

                if (e.gamepad.axes[ 3 ] != 0)
                {

                    XRInput.controllerGrips[ i ].getWorldDirection(CamForward);
                    forwardOffset = CamForward.multiplyScalar(e.gamepad.axes[ 3 ] > 0 ? .02 : -.02)
                    this.position.add(forwardOffset);
                    forwardOffset.x = forwardOffset.y = forwardOffset.z = 0;
                }
                this.position.y = XRInput.controllerGrips[ 0 ].position.y;
            });
        }
    }
    return placementCubeInstance;

}


const initPlacement = () =>
{
    State.GameState = GameState.placement;

    placementCube = PlacementCube();
    scene.add(placementCube);
    networking.remoteSync.addSharedObject(placementCube, 3, true);
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
XRInput.controllerGrips.forEach(ctrl =>
{
    ctrl.addEventListener("selectstart", e =>
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
                    // TOOD: implement dclick
                    // location.reload();
                }
                break;
        }
    });
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