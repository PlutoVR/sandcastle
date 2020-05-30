// SURGICAL PLANNING sample code
// important: test in metachromium which enables transparent WebXR rendering on desktop!
// https://github.com/webaverse/metachromium-bin

import { Scene, Color, Mesh, SphereBufferGeometry, MeshNormalMaterial, Object3D, HemisphereLight, DirectionalLight, ShaderMaterial, AdditiveBlending, BufferGeometry, TextureLoader, Float32BufferAttribute, Points, DynamicDrawUsage, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { camera} from "../../engine/engine"
import { Renderer } from "../../engine/renderer"
import { XRInput } from "../../engine/xrinput";
import { State } from "../../engine/state";
import { PeerConnection } from '../../engine/networking/PeerConnection'

const GLTFHeart = require("./assets/models/heart/heart.glb");

export const scene = new Scene();
const networking = new PeerConnection(scene);

scene.init = () =>
{
    const loader = new GLTFLoader();

    // "A simulated heart" developed by Ryan James
    let heart;
    loader.load(GLTFHeart, function (gltf)
    {
        heart = gltf.scene.children[ 0 ];
        heart.position.x = 0;
        heart.position.y = 0;
        heart.position.z = -0.5;

        heart.scale.x = .1;
        heart.scale.y = .1;
        heart.scale.z = .1;

        networking.remoteSync.addSharedObject(heart);

        camera.add(heart);
    });

    const geo = new SphereBufferGeometry(.1, 13, 13);
    const mat = new MeshNormalMaterial({ wireframe: true });
    const mesh = new Mesh(geo, mat);

    for(var gripIndex = 0; gripIndex < XRInput.controllerGrips.length; gripIndex++) {
        var e = XRInput.controllerGrips[gripIndex];
        const sp = mesh.clone();

        sp.Update = () =>
        {
            sp.position.copy(e.position);
            sp.quaternion.copy(e.quaternion);

            if (e.isSelecting) {
                heart.position.copy(e.position);
                heart.quaternion.copy(e.quaternion);
            }

            Renderer.xr.getController(gripIndex);
            
        }
        networking.remoteSync.addSharedObject(sp);
        scene.add(sp);
    }

    State.eventHandler.addEventListener("xrsessionstarted", (e) =>
    {
        for (let controllerIndex = 0; controllerIndex < 2; controllerIndex++)
        {
            const controller = Renderer.xr.getController(controllerIndex);
            const controllerGrip = Renderer.xr.getControllerGrip(controllerIndex)

            controller.addEventListener('selectstart', (selectedEvent) => {
                controllerGrip.isSelecting = true
                scene.add(heart)
            });

            controller.addEventListener('selectend', (selectedEvent) => {
                controllerGrip.isSelecting = false
            });
        }
    });

    XRInput.showDebugOutput = false;
}
scene.init();