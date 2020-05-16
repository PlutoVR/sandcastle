import { Scene, Mesh, SphereGeometry, MeshNormalMaterial, Vector3, Group, PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Physics } from '../../engine/physics';
import { renderer } from '../../engine/renderer';
import { ctrlArr } from '../../engine/xrinput';
import { PeerConnection } from '../../engine/networking/PeerConnection'

const screenCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
screenCamera.position.set(0, 0, 5);
const OC = new OrbitControls(screenCamera, renderer.domElement);
const scene = new Scene();

Physics.enableDebugger(scene);

scene.initGame = () =>
{
    //clean up scene and physics
    // Physics.resetScene();

    scene.traverse(e =>
    {
        scene.remove(e);
    });

    ctrlArr.forEach((controller, i) => 
    {
        scene.add(controller);
        Physics.addControllerRigidBody(controller);
        // PeerConnection.addSharedObject(ctrl, i * 1000);
    });

    scene.createTestSphere();
}

scene.createTestSphere = () =>
{
    const testSphere = new Mesh(new SphereGeometry(1.3, 16, 16), new MeshNormalMaterial);
    testSphere.position.set(0, 0, -3);
    // PeerConnection.addSharedObject(testSphere, 11);
    scene.add(testSphere);
    window.addEventListener('keydown', e =>
    {
        if (!testSphere) return;

        switch (e.keyCode)
        {
            case 87:
                testSphere.position.y += 0.05;
                break;
            case 65:
                testSphere.position.x -= 0.05;
                break;
            case 83:
                testSphere.position.y -= 0.05;
                break;
            case 68:
                testSphere.position.x += 0.05;
                break;
            default:
                break;

        }
    });

}

scene.initGame();

export { scene, screenCamera }