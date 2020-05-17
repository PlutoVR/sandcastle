import { state } from "./state";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { renderer } from "./renderer";
import { scene, camera } from "../scenes/defaultScene"
import { Physics } from "./physics";
import { PeerConnection } from "./networking/PeerConnection"

// import PhysicsSolver from './physics.worker.js';


// Screen cam orbitcontrols

// main app render loop
renderer.setAnimationLoop(() =>
{
    // RENDERING
    renderer.render(scene, camera);

    // PHYSICS
    if (!state.isPaused && state.hasPhysics)
    {
        Physics.updatePhysics();
    }

    // Networking
    if (state.hasNetworking)
    {
        PeerConnection.sync();
    }


    // TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
    scene.traverse(obj => { typeof obj.update === 'function' ? obj.update() : false });
});



const onWindowResize = () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// DOM append
document.querySelector(".app").appendChild(renderer.domElement);
// webxr button
const a = document.querySelector(".app").appendChild(VRButton.createButton(renderer));
a.style.background = "black";