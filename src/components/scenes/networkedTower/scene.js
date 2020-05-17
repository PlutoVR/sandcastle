import { state } from "../../engine/state"
import { Scene, Vector3, Group, PerspectiveCamera } from "three";
import Brick from './brickCustomShader';
import { Physics } from '../../engine/physics';
import { ctrlArr } from '../../engine/xrinput';

import { SharedExperience } from '../../engine/networking/PeerConnection'

state.hasNetworking = true;
state.hasPhysics = true;
const scene = new Scene();
scene.se = new SharedExperience();


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
        scene.se.PeerConnection.addSharedObject(controller, (i + 1) * 10);
    });

    // scene.createTestSphere();

    const tower = new Group();
    tower.position.set(0, 0, 0);
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
                Physics.addBody(e, Physics.RigidBodyType.Box);
                // tower.attach(e);
            });
        });
    }
    scene.se.PeerConnection.addSharedObject(tower, '0');
    scene.add(tower);
}

scene.initGame();

export { scene }