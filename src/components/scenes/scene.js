import { state } from '../engine/state';
import { Scene, DirectionalLight, AxesHelper, Vector3, Euler, Object3D } from "three";
import Piece from '../assets/jengapiece';
import { physics, rigidbodies } from '../engine/physics';
import { controller1, controller2 } from '../engine/xrinput';

export const scene = new Scene();

const ResetGame = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    const tower = new Object3D();
    for (let y = 1; y < 10; y++)
    {
        const group = new Object3D();
        for (let x = 0; x < 3; x++)
        {
            const piece = new Piece(new Vector3((-1 + x) / 2 + x * .01, y / 1.9, 0));
            group.add(piece);
        }
        if (y % 2 == 0) { group.setRotationFromAxisAngle(new Vector3(0, 1, 0), 1.5708); }
        tower.add(group);
    }

    scene.add(tower);
    // tower.position.x += 2;

    scene.traverse(e =>
    {
        if (e.hasPhysics) physics.addBody(e);
    });

    const axesHelper = new AxesHelper(5);
    scene.add(axesHelper)
    // var light = new DirectionalLight(0xffffff, 1.0);
    // scene.add(light);
    // physics.addTrigger(controller1);
    // physics.addTrigger(controller2);
    scene.add(controller1);
    scene.add(controller2);
}

ResetGame();