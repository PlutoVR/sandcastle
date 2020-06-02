// scene to run:

import { scene } from "../examples/pongxr/scene"

import State from "./state";
import { PerspectiveCamera, AudioListener } from "three";
import EngineEditorCamera from "./util/cameracontrols/EngineEditorCamera";
import VRButton from "./util/webxr/SessionHandler";
import Renderer from "./renderer";
import Physics from "./physics/physics";
// import PhysicsSolver from './physics.worker.js';
import XRInput from "./xrinput"

// editor camera + audiolistener
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

scene.add(new EngineEditorCamera(camera, Renderer.domElement));
const listener = new AudioListener();
camera.add(listener);
scene.add(camera);
State.globals.AudioListener = listener;

// main app render loop
Renderer.setAnimationLoop(() =>
{
    // RENDERING
    Renderer.render(scene, camera);

    // INPUT
    if (State.isXRSession) XRInput.Update();

    // PHYSICS
    if (!State.isPaused) Physics.Update();

    // TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
    scene.traverse(obj => { typeof obj.Update === 'function' ? obj.Update() : false });
});

// DOM append
document.querySelector(".app").appendChild(Renderer.domElement);

// WebXR button
document.querySelector(".app").appendChild(new VRButton(Renderer));

window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    Renderer.setSize(window.innerWidth, window.innerHeight);
});