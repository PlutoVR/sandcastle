import { Scene, Object3D } from "three";
import XRInput from "../../engine/xrinput";
import PeerConnection from "../../engine/networking/PeerConnection";
import State from "../../engine/state";
import Physics from "../../engine/physics/physics";

import HostBot from "../../engine/util/hostbot";
import Level from "./level";
import Paddle from "./paddle";
import Ball from "./ball";
import PlacementCube from "./placementcube";

const PLACEMENTCUBEID = 3;
const scene = new Scene();
const networking = new PeerConnection(scene);
const hostBot = new HostBot(networking);
let ball, placementCube;
let paddles = [];

// custom States & events
State.eventHandler.registerEvent("gameover");
const GameState = { placement: 1, play: 2 };

Physics.enableDebugger(scene);

const createPongLevel = placementCube => {
  const targetPosition = placementCube.position;
  const targetRotation = placementCube.rotation;

  State.GameState = GameState.play;
  const curPosRot = { position: targetPosition, rotation: targetRotation };
  const level = new Level(curPosRot);
  scene.add(level);
  networking.remoteSync.addLocalObject(
    level,
    { type: "level", posRot: curPosRot },
    true
  );

  // dumb hack for the other side
  placementCube.scale.set(0, 0, 0);

  // local
  scene.remove(placementCube);
  // remote placement cube removal, not currently working on metachromium
  networking.remoteSync.removeSharedObject(PLACEMENTCUBEID);

  // BALL
  if (State.isMaster) {
    ball = new Ball(targetPosition, true);
    ball.initPos = targetPosition;
    scene.add(ball);
    networking.remoteSync.addLocalObject(
      ball,
      { type: "ball", position: targetPosition },
      true
    );
  }
};

const initPlacement = () => {
  State.GameState = GameState.placement;
  placementCube = PlacementCube();
  scene.add(placementCube);
  networking.remoteSync.addSharedObject(placementCube, PLACEMENTCUBEID, true);
};

/// GAME STATE

State.eventHandler.addEventListener("gameover", e => {
  if (ball != undefined) {
    ball.reset();
  } else {
    console.error("can't reset; no ball found!");
  }
});

/// INPUT

let doubleClick = false;

State.eventHandler.addEventListener("select", e => {
  switch (State.GameState) {
    case GameState.placement:
      if (State.isMaster) {
        createPongLevel(placementCube);
      }
      break;

    case GameState.play:
    default:
      if (!doubleClick) {
        doubleClick = true;
        setTimeout(function () {
          if (ball == undefined) {
            console.error("can't kickoff; no ball found!");
            return;
          }
          ball.kickoff();
          doubleClick = false;
        }, 200);
      } else {
        if (State.debugMode) console.log("doubleclick");
        // TOOD: implement dclick reset
        // location.reload();
      }
      break;
  }
});

// Add paddles when we know our inputs
State.eventHandler.addEventListener("inputsourceschange", e => {
  if (paddles.length != 0) return; //  avoid false positives, i.e headset put down, but paddles already instantiated

  XRInput.controllerGrips.forEach((e, i) => {
    const paddle = new Paddle();
    scene.add(paddle);
    paddles.push(paddle);
    networking.remoteSync.addLocalObject(paddle, { type: "paddle" }, true);
  });

  // local paddle controller component to control player's networked paddle
  // note: *all* XRInput data is local.
  // only the objects sync'd to it are networked.
  // note2: we don't add it to rAF via Update() due to accumulated rAF lagginess over time.

  setInterval(function () {
    paddles.forEach((paddle, i) => {
      if (XRInput.controllerGrips[i] != undefined) {
        paddle.position.lerp(XRInput.controllerGrips[i].position, 0.5);
        paddle.quaternion.slerp(XRInput.controllerGrips[i].quaternion, 0.5);
      }
    });
  }, 50);
});

/// NETWORKING

networking.remoteSync.addEventListener("open", e => {
  initPlacement();
});

networking.remoteSync.addEventListener("add", (destId, objectId, info) => {
  switch (info.type) {
    case "ball":
      const ball = new Ball(info.position, false); // only add RB once to fake server-client physics model
      networking.remoteSync.addRemoteObject(destId, objectId, ball);
      scene.add(ball);
      break;

    case "paddle":
      const p = new Paddle();
      networking.remoteSync.addRemoteObject(destId, objectId, p);
      scene.add(p);
      break;

    case "level":
      const l = new Level(info.posRot);
      networking.remoteSync.addRemoteObject(destId, objectId, l);
      scene.add(l);
      break;

    case "placementcube":
      const pc = PlacementCube();
      networking.remoteSync.addRemoteObject(destId, objectId, pc);
      scene.add(pc);
    default:
      return;
  }
});

networking.remoteSync.addEventListener(
  "remove",
  (remotePeerId, objectId, object) => {
    if (State.debugMode) console.log("removing");
    scene.remove(object);
    if (object.parent !== null) object.parent.remove(object);
  }
);

export { scene };
