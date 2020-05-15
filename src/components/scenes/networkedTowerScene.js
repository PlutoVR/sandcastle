import { Scene, Vector3, Group, PerspectiveCamera } from "three";
import Brick from '../assets/brickCustomShader';
import { Physics } from '../engine/physics';
import { controller1, controller2 } from '../engine/xrinput';

import { PeerConnection } from '../engine/networking/PeerConnection'

const screenCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
screenCamera.position.z = 10;

const scene = new Scene();

Physics.enableDebugger(scene);

scene.initGame = () =>
{
    //clean up scene and physics
    // Physics.resetScene();
    // PeerConnection.resetScene();
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    const tower = new Group();
    tower.position.set(2, 0, 0);
    for (let y = 1; y < 14; y++)
    {
        const level = new Group();
        for (let x = 0; x < 3; x++)
        {
            const brickPos = new Vector3((-1 + x) / 2 + x * .01, y / 1.9, 0);
            const brick = new Brick(brickPos, y % 5);
            level.add(brick);
        }
        if (y % 2 == 0) { level.rotateOnAxis(new Vector3(0, 1, 0), 1.5708); }
        tower.add(level);
        scene.updateMatrixWorld();
        tower.children.forEach(e =>
        {
            level.children.forEach(e =>
            {
                //remove from groups due to physics constraints
                scene.attach(e);
                // if (!e.hasPhysics) return;
                Physics.addBody(e, Physics.RigidBody.Box);
                // tower.attach(e);
            });
        });
    }
    PeerConnection.addSharedObject(tower, '0');
    scene.add(tower);

    // const axesHelper = new AxesHelper(5);
    // scene.add(axesHelper)
    // const light = new THREE.DirectionalLight(0xffffff, 1.0);
    // scene.add(light);
    // physics.addTrigger(controller1);
    // physics.addTrigger(controller2);
    scene.add(controller1);
    scene.add(controller2);
    PeerConnection.addSharedObject(controller1, 10);
    PeerConnection.addSharedObject(controller2, 11);
}

// scene.createTestSphere = () =>
// {
//     const testSphere = new Mesh(new SphereGeometry(1.3, 16, 16), new MeshNormalMaterial);
//     testSphere.position.set(0, 0, 1);
//     PeerConnection.addSharedObject(testSphere, 11);
//     scene.add(testSphere);
//     window.addEventListener('keydown', e =>
//     {
//         if (!testSphere) return;

//         switch (e.keyCode)
//         {
//             case 87:
//                 testSphere.position.y += 0.05;
//                 break;
//             case 65:
//                 testSphere.position.x -= 0.05;
//                 break;
//             case 83:
//                 testSphere.position.y -= 0.05;
//                 break;
//             case 68:
//                 testSphere.position.x += 0.05;
//                 break;
//             default:
//                 break;

//         }
//     });

// }

scene.initGame();

export { scene, screenCamera }