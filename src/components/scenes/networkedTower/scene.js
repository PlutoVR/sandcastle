import { state } from "../../engine/state"
import { Scene, Vector3, Group, MeshNormalMaterial, Mesh } from "three";
import Brick from './brickCustomShader';
import { Physics } from '../../engine/physics';
import { XRInput } from '../../engine/xrinput';

import { SharedExperience } from '../../engine/networking/PeerConnection'

const scene = new Scene();
scene.networking = new SharedExperience();

Physics.enableDebugger(scene);

const RNG = () =>
{
    return Math.floor(Math.random() * 1000000000)
}

scene.initGame = () =>
{
    // scene.traverse(e =>
    // {
    //     scene.remove(e);
    // });
    XRInput.controllerGrips.forEach((controller, i) => 
    {
        Physics.addControllerRigidBody(controller);
        scene.networking.remoteSync.addSharedObject(controller, RNG());
        scene.add(controller);

    });

    const tower = new Group();

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

        // 0 pos is more likely to clash w/viewer
        tower.position.set(0, 0, -2);
        scene.updateMatrixWorld();
        tower.children.forEach((level, x) =>
        {
            level.children.forEach((brick, y) =>
            {
                if (!(brick instanceof (Mesh))) return;
                scene.attach(brick);
                Physics.addRigidBody(brick, Physics.RigidBodyType.Box);
                scene.networking.remoteSync.addSharedObject(brick, RNG());

            })
        });
    }
}

state.eventHandler.addEventListener("peerconnected", (e) =>
{
    scene.initGame();
});


export { scene }