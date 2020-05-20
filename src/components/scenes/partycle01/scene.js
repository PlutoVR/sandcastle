import { Scene, Mesh, SphereGeometry, MeshNormalMaterial, Vector3, Group, PerspectiveCamera } from "three";
import { Physics } from '../../engine/physics';
import { renderer } from '../../engine/renderer';
import { ctrlArr } from '../../engine/xrinput';
// import { PeerConnection } from '../../engine/networking/PeerConnection'

const scene = new Scene();

Physics.enableDebugger(scene);

scene.initGame = () =>
{
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
}

scene.initGame();

export { scene }