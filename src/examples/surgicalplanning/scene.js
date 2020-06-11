// SURGICAL PLANNING sample code
// important: test in metachromium which enables transparent WebXR rendering on desktop!
// https://github.com/webaverse/metachromium-bin

import { Scene, Color, Mesh, Plane, DoubleSide, SphereBufferGeometry, PlaneBufferGeometry, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, Object3D, HemisphereLight, DirectionalLight, SpotLight, ShaderMaterial, AdditiveBlending, BufferGeometry, TextureLoader, Float32BufferAttribute, Points, DynamicDrawUsage, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { camera } from "../../engine/engine"
import { Renderer } from "../../engine/renderer"
import { XRInput } from "../../engine/xrinput";
import { State } from "../../engine/state";
import { PeerConnection } from '../../engine/networking/PeerConnection'

const GLTFHeart = require("./assets/models/heart/heart.glb");

export const scene = new Scene();
const networking = new PeerConnection(scene);

scene.init = () =>
{
    var spotLight = new SpotLight( 0xffffff );
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.2;
    spotLight.position.set( 2, 3, 3 );
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 3;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add( spotLight );

    var dirLight = new DirectionalLight( 0x55505a, 1 );
    dirLight.position.set( 0, 3, 0 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 10;

    dirLight.shadow.camera.right = 1;
    dirLight.shadow.camera.left = - 1;
    dirLight.shadow.camera.top	= 1;
    dirLight.shadow.camera.bottom = - 1;

    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add( dirLight );

    var localPlane = new Plane( new Vector3( 0, 0, 0.5 ), 0.8 );
    Renderer.clippingPlanes = [localPlane]
    Renderer.localClippingEnabled = true;

    var clippingPlaneGeometry = new PlaneBufferGeometry( localPlane.x, localPlane.y, localPlane.z, 1 )
    var clippingPlaneMaterial = new MeshBasicMaterial( {
        color: 'green',
        side: DoubleSide,

        opacity: 0.2,
        transparent: true,
    } );

    var clippingPlaneMesh = new Mesh( clippingPlaneGeometry, clippingPlaneMaterial );
    clippingPlaneMesh.matrixAutoUpdate = false;

    scene.add( clippingPlaneMesh );
    clippingPlaneMesh.Update = () => {
        clippingPlaneMesh.set(localPlane.normal.x, localPlane.normal.y, localPlane.normal.z)
    }

    const loader = new GLTFLoader();

    // "A simulated heart" developed by Ryan James
    let heart;
    loader.load(GLTFHeart, function (gltf)
    {
        heart = gltf.scene.children[ 0 ];
        heart.position.set(0, 0, -0.5);
        heart.scale.set(0.1, 0.1, 0.1);

        networking.remoteSync.addSharedObject(heart);

        var heartMaterial = new MeshPhongMaterial( {
            color: 'red',
            shininess: 100,
            side: DoubleSide,

            // ***** Clipping setup (material): *****
            clippingPlanes: [ localPlane ],
            clipShadows: true
        });

        heart.material = heartMaterial;

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
                //heart.quaternion.copy(e.quaternion);
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