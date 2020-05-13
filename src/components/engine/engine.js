import { state } from "./state";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { renderer } from "./renderer";
import { scene, screenCamera, PeerConnection } from "../scenes/networkedJenga";
import { physics } from "./physics";
import CannonDebugRenderer from "./util/CannonDebugRenderer";

// import PhysicsSolver from './physics.worker.js';
const OC = new OrbitControls(screenCamera, renderer.domElement);

const PhysicsDebug = new CannonDebugRenderer(scene, physics.cannonWorld);

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
    if (state.debugPhysics) PhysicsDebug.update();

    // Networking
    PeerConnection.sync();

    // Screen cam orbitcontrols
    OC.update();
});

// TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
// scene.traverse(obj => { typeof obj.update === 'function' ? obj.update() : false });

const onWindowResize = () =>
{
    screenCamera.aspect = window.innerWidth / window.innerHeight;
    screenCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// DOM append
document.querySelector(".app").appendChild(renderer.domElement);
// webxr button
document.querySelector(".app").appendChild(VRButton.createButton(renderer));



