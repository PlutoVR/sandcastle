import { State } from "./state";
import { PerspectiveCamera } from "three";
import { EngineEditorCamera } from "./util/cameracontrols/EngineEditorCamera";
import { VRButton } from "./util/webxr/SessionHandler";
import { Renderer } from "./renderer";
import { Physics } from "./physics";
// import PhysicsSolver from './physics.worker.js';
import { scene } from "../examples/defaultscene"
import { XRInput } from "./xrinput"

// editor camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
scene.add(new EngineEditorCamera(camera, Renderer.domElement));
scene.add(camera);

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

window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    Renderer.setSize(window.innerWidth, window.innerHeight);
});

// DOM append
document.querySelector(".app").appendChild(Renderer.domElement);

// WebXR button
document.querySelector(".app").appendChild(new VRButton(Renderer));