import { state } from "./state";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { renderer } from "./renderer";
import { scene } from "../scenes/scene-postprocessing";
import { physics } from "./physics";
// import PhysicsSolver from './physics.worker.js';

const screenCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
screenCamera.position.z = 13;
const OC = new OrbitControls(screenCamera, renderer.domElement);

// main app render loop
renderer.setAnimationLoop(() =>
{
    // RENDERING
    renderer.render(scene, screenCamera);

    // PHYSICS
    if (!state.isPaused)
    {
        physics.updatePhysics();
    }

    OC.update();
});

// TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
scene.traverse(obj => { typeof obj.update === 'function' ? obj.update() : false });

const onWindowResize = () =>
{
    screenCamera.aspect = window.innerWidth / window.innerHeight;
    screenCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

// DOM append
document.body.appendChild(renderer.domElement);
// webxr button
document.body.appendChild(VRButton.createButton(renderer));



