import { Scene, PerspectiveCamera, TorusBufferGeometry, MeshNormalMaterial, Mesh, Vector3 } from "three";
import { EngineEditorCamera } from "../../engine/util/EngineEditorCamera";
import { renderer } from '../../engine/renderer';
import { ctrlArr } from '../../engine/xrinput';

const scene = new Scene();

scene.init = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });


    // XR Controllers
    ctrlArr.forEach((controller, i) => 
    {
        scene.add(controller);
    });
    const rots = [new Vector3(-1, 0, 0), new Vector3(1, 1, 0), new Vector3(0, -1, 0)]
    for (var i = 0; i < 3; i++)
    {
        const placeholder = new Mesh(new TorusBufferGeometry(1, .05, 16, 32), new MeshNormalMaterial({ wireframe: true }));
        placeholder.position.z -= 5;
        placeholder.scale.set(1 - i * .33, 1 - i * .33, 1 - i * .33);
        const axis = new Vector3();
        axis.copy(rots[i]);
        placeholder.update = () =>
        {
            placeholder.rotateOnAxis(axis, 0.017);
        }
        scene.add(placeholder);
    }
}
scene.init();

export { scene }