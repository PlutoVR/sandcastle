import { State } from "../../engine/state"
import { Scene, Vector3, Group, MeshNormalMaterial, Mesh } from "three";
import Brick from './brickCustomShader';
import { Physics } from '../../engine/physics/physics';
import { XRInput } from '../../engine/xrinput';

import { PeerConnection } from '../../engine/networking/PeerConnection'

const scene = new Scene();
const networking = new PeerConnection(scene);

// start Physics debug
Physics.enableDebugger(scene);


// //Plane. TODO: fix relo!
// const groundShape = new Plane();
// const groundBody = new Body({
//     mass: 0
// });
// groundBody.addShape(groundShape);
// groundBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
// Physics.cannonWorld.add(groundBody);
// Physics.rigidbodies.push(groundBody);


scene.initGame = () =>
{
    XRInput.controllerGrips.forEach((controller, i) => 
    {
        // add controller RBs
        Physics.addControllerRigidBody(controller);

        // network controllers
        networking.remoteSync.addSharedObject(controller);

        // create controller models
        XRInput.CreateControllerModel(controller, scene);

        // add to scene
        scene.add(controller);
    });

    // BLOCK TOWER
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
        tower.position.set(0, 0, -.5);
        scene.updateMatrixWorld();
        tower.children.forEach((level, x) =>
        {
            level.children.forEach((brick, y) =>
            {
                if (!(brick instanceof (Mesh))) return;
                scene.attach(brick);
                //dumb hack to avoid false positive for remoteSync.master
                // setTimeout(e =>
                // {
                //     if (networking.remoteSync.master == true)
                //     {
                //         // Physics.addRigidBody(brick, Physics.RigidBodyType.Box);
                //     }
                // }, 5);
                Physics.addRigidBody(brick, Physics.RigidBodyType.Box);
                // networking.remoteSync.addSharedObject(brick);
            })
        });
    }
}

State.eventHandler.addEventListener("peerconnected", (e) =>
{
    scene.initGame();
});


export { scene }