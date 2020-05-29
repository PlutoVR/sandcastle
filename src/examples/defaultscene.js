// default scene loaded in src/engine/engine.js

import { Scene, TorusBufferGeometry, MeshNormalMaterial, Mesh, Vector3 } from "three";
const scene = new Scene();

scene.init = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    const rots = [ new Vector3(-1, 0, 0), new Vector3(1, 1, 0), new Vector3(0, -1, 0) ]
    for (var i = 0; i < 3; i++)
    {
        const placeholder = new Mesh(new TorusBufferGeometry(1, .05, 16, 32), new MeshNormalMaterial({ wireframe: true }));
        placeholder.position.z -= 5;
        placeholder.scale.set(1 - i * .33, 1 - i * .33, 1 - i * .33);
        const axis = new Vector3();
        axis.copy(rots[ i ]);
        placeholder.Update = () =>
        {
            placeholder.rotateOnAxis(axis, 0.007);
        }
        scene.add(placeholder);
    }
}

scene.init();

export { scene }