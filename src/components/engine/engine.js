import { state } from "./state";
import { PerspectiveCamera } from "three";
import { EngineEditorCamera } from "./util/EngineEditorCamera";
import { VRButton } from './util/SessionHandler';
import { renderer } from "./renderer";
import { Physics } from "./physics";
// import PhysicsSolver from './physics.worker.js';
import { scene } from "../scenes/veraMolnar/scene"
import { xrInput } from "../engine/xrinput"

// editor camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
scene.add(new EngineEditorCamera(camera, renderer.domElement));
scene.add(camera);

// main app render loop
renderer.setAnimationLoop(() =>
{
    // RENDERING
    renderer.render(scene, camera);

    // INPUT
    if (state.xrSession) xrInput.updateControllers();

    // PHYSICS
    if (!state.isPaused) Physics.updatePhysics();

    // NETWORKING
    if (scene.networking != undefined) scene.networking.PeerConnection.sync();

    // TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
    scene.traverse(obj => { typeof obj.Update === 'function' ? obj.Update() : false });
});

window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// DOM append
document.querySelector(".app").appendChild(renderer.domElement);

// WebXR button
const a = document.querySelector(".app").appendChild(new VRButton(renderer));