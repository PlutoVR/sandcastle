import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { renderer } from "./renderer";
import { scene } from "../scene";
import { physics } from "./physics";
import PhysicsSolver from './physics.worker.js';


const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 13;
const OC = new OrbitControls(camera, renderer.domElement);

// main app render loop
renderer.setAnimationLoop(() =>
{
    // RENDERING
    renderer.render(scene, camera);

    // PHYSICS
    physics.updatePhysics();

    // TODO: INPUT

    OC.update();

    // TRAVERSE UPDATE LOOPS IN SCENE OBJECTS
    scene.traverse(obj => { typeof obj.update === 'function' ? obj.update() : false });

    const onWindowResize = () =>
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    // webxr button
    document.body.appendChild(VRButton.createButton(renderer));
    // DOM append
    document.body.appendChild(renderer.domElement);
});
