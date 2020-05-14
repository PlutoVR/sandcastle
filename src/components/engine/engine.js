import { state } from "./state";
import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { renderer } from "./renderer";
import { scene, screenCamera } from "../scenes/networkedTowerScene"
import { Physics } from "./physics";
import { PeerConnection } from "./networking/PeerConnection"

// import PhysicsSolver from './physics.worker.js';
const OC = new OrbitControls(screenCamera, renderer.domElement);

// main app render loop
renderer.setAnimationLoop(() =>
{
    // RENDERING
    renderer.render(scene, screenCamera);

    // PHYSICS
    if (!state.isPaused)
    {
        Physics.updatePhysics();
    }

    // Networking
    PeerConnection.sync();

    // Screen cam orbitcontrols
    OC.update();

    // TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
    scene.traverse(obj => { typeof obj.update === 'function' ? obj.update() : false });
});



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



