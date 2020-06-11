import Sandcastle from "sandcastle"
import { Vector3 } from "three"
const GLTFHeart = require("./assets/models/heart/heart.glb");

Sandcastle.run(async (scene, controllers) => {
    var heart = await Sandcastle.loadGLTF({
        path: GLTFHeart,
        position: new Vector3(0, 1, 2),
        shared: true,
        canGrab: true,
        canZoom: true,
        onLoaded: (heartSceneObj) => {
            // Apply bounding box?
        }
    })

    scene.camera.add(heart)

    // Add clipping plane

    // Add lighting
})