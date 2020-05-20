import { Scene, Mesh, SphereGeometry, MeshNormalMaterial, Vector3, Group, PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls"
import { EditorCamera } from "../../engine/util/editorCamera"
import { Physics } from '../../engine/physics';
import { renderer } from '../../engine/renderer';
import { ctrlArr } from '../../engine/xrinput';
import { PeerConnection } from '../../engine/networking/PeerConnection'


// screenCamera.position.set(0, 0, 5);
// const OC = new OrbitControls(screenCamera, renderer.domElement);

// const controls = new PointerLockControls(screenCamera, renderer.domElement);
// document.addEventListener('click', () => { controls.lock(); });
// const onKeyDown = function (event)
// {
//     switch (event.keyCode)
//     {
//         case 87: // w
//             controls.moveForward(.25)
//             break;
//         case 65: // a
//             controls.moveRight(-.25)
//             break;
//         case 83: // s
//             controls.moveForward(-.25)
//             break;
//         case 68: // d
//             controls.moveRight(.25)
//             break;
//     }
// };
// document.addEventListener('keydown', onKeyDown, false);

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const editorCamera = new EditorCamera(camera, renderer.domElement);
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

    scene.add(editorCamera);

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
    for (let i = 0; i < 6; i++)
    {
        for (let j = 0; j < 6; j++)
        {
            for (let k = 0; k < 6; k++)
            {
                const testSphere = new Mesh(new SphereGeometry(.3, 16, 16), new MeshNormalMaterial);
                testSphere.position.set(3 - i * 2, 3 - j * 2, 3 - k * 2);
                scene.add(testSphere);
            }
        }
    }
    // PeerConnection.addSharedObject(testSphere, 11);
    window.addEventListener('keydown', e =>
    {
        // if (!testSphere) return;

        // switch (e.keyCode)
        // {
        //     case 87:
        //         testSphere.position.y += 0.05;
        //         break;
        //     case 65:
        //         testSphere.position.x -= 0.05;
        //         break;
        //     case 83:
        //         testSphere.position.y -= 0.05;
        //         break;
        //     case 68:
        //         testSphere.position.x += 0.05;
        //         break;
        //     default:
        //         break;

        // }
    });

}

scene.initGame();

export { scene, camera }