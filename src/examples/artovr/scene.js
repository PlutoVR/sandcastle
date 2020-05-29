import { Scene, Object3D, PlaneBufferGeometry, DirectionalLight, TextureLoader, RepeatWrapping, CubeCamera, WebGLCubeRenderTarget, RGBAFormat, LinearMipmapLinearFilter } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { Renderer } from "../../engine/renderer"
import { XRInput } from "../../engine/xrinput";

import { Boid } from "./boid";
import { Water } from './water';
import { Sky } from './sky.js';
const WaterNormalsTexture = require("./assets/textures/waternormals.jpg");

export const scene = new Scene();

scene.init = () =>
{
    // Boids

    const loader = new GLTFLoader();
    // "Anonymous Bird" from https://poly.google.com/view/8Ph79kHbt9s
    const modelPath = "./examples/artovr/assets/models/polyCrow/polyCrow_updated.glb";
    let bird;
    loader.load(modelPath, function (gltf)
    {
        bird = gltf.scene.children[ 0 ];
        setupFlock(400, bird);
    });

    const boids = [];
    const setupFlock = (count, obj) =>
    {
        let i = 0;
        while (i < count)
        {
            boids[ i ] = new Boid(scene, obj);
            i++;
        }
    }

    // Ocean

    const light = new DirectionalLight(0xffffff, 0.8);
    scene.add(light);
    const waterGeometry = new PlaneBufferGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load(WaterNormalsTexture, function (texture)
            {
                texture.wrapS = texture.wrapT = RepeatWrapping;
            }),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined,
        }
    );
    water.rotation.x = - Math.PI / 2;
    water.position.y = -3;
    scene.add(water);


    // Atmosphere / day-night cycle. Custom XRCubeCamera component that handles XR rendering, soon merged to threeJS:

    const sky = new Sky();
    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = 10;
    uniforms[ 'rayleigh' ].value = 2;
    uniforms[ 'luminance' ].value = 1;
    uniforms[ 'mieCoefficient' ].value = 0.005;
    uniforms[ 'mieDirectionalG' ].value = 0.8;

    var cubeRenderTarget = new WebGLCubeRenderTarget(512, { format: RGBAFormat, generateMipmaps: true, minFilter: LinearMipmapLinearFilter });

    const cubeCamera = new CubeCamera(0.1, 1000, cubeRenderTarget);
    cubeCamera.renderTarget.texture.generateMipmaps = true;
    cubeCamera.renderTarget.texture.minFilter = LinearMipmapLinearFilter;
    scene.background = cubeCamera.renderTarget;

    const parameters = {
        distance: 400,
        inclination: 0.49,
        azimuth: 0.205
    };
    let sunTheta = Math.PI * (parameters.inclination - 0.5);
    let sunPhi = 2 * Math.PI * (parameters.azimuth - 0.5);


    // tap render loop's rAF to update certain vars every frame;
    const data = new Object3D();
    data.Update = () =>
    {
        // boids update
        for (let i = 0; i < boids.length; i++)
        {
            boids[ i ].step(boids);
        }

        // day/night cycle

        // long nights are boring:
        parameters.inclination = parameters.inclination <= -0.55000 ? 0.55 : parameters.inclination - 0.00025;
        sunTheta = Math.PI * (parameters.inclination - 0.5);
        sunPhi = 2 * Math.PI * (parameters.azimuth - 0.5);
        light.position.x = parameters.distance * Math.cos(sunPhi);
        light.position.y = parameters.distance * Math.sin(sunPhi) * Math.sin(sunTheta);
        light.position.z = parameters.distance * Math.sin(sunPhi) * Math.cos(sunTheta);
        sky.material.uniforms[ 'sunPosition' ].value = light.position.copy(light.position);

        // water
        water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
        water.material.uniforms[ 'sunDirection' ].value.copy(light.position).normalize();
        cubeCamera.update(Renderer, sky);
    };
    scene.add(data);

    //toggle VR: day/night cycle vs. AR: transparent background
    XRInput.onSelect = function ()
    {
        scene.background == null ? scene.background = cubeCamera.renderTarget : scene.background = null;
    }

}
scene.init();