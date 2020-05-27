import { Scene, Vector3, Group, MeshNormalMaterial, Mesh } from "three";
import Brick from './brickCustomShader';
import { Physics } from '../../engine/physics';
import { XRInput } from '../../engine/xrinput';

import { SharedExperience } from '../../engine/networking/PeerConnection'
import { state } from "../../engine/state";

const scene = new Scene();
scene.networking = new SharedExperience();

Physics.enableDebugger(scene);

const RNG = () =>
{
    return Math.floor(Math.random() * 1000000000)
}

scene.initGame = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    XRInput.controllerGrips.forEach((controller, i) => 
    {
        // console.log(controller);
        scene.add(controller);
        Physics.addControllerRigidBody(controller);
        scene.networking.PeerConnection.addSharedObject(controller, (i + 1) * 10);
    });

    const tower = new Group();
    tower.position.set(0, 0, -1);
    for (let y = 0; y < 13; y++)
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
        tower.children.forEach((level, x) =>
        {
            level.children.forEach((brick, y) =>
            {
                if (!(brick instanceof (Mesh))) return;
                scene.attach(brick);
                Physics.addBody(brick, Physics.RigidBodyType.Box);
                scene.networking.PeerConnection.addSharedObject(brick, RNG());
            })
        });
    }
}

scene.initGame();

export { scene }