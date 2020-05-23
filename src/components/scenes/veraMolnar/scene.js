import { Scene, Object3D, MeshNormalMaterial, SpriteMaterial, Vector3, UniformsUtils, ShaderLib, DirectionalLight, Geometry, ImageUtils, ShaderMaterial, Mesh, Fog, GeometryUtils, LinearMipmapLinearFilter, PlaneBufferGeometry, RepeatWrapping } from "three";
import { XRCubeCamera } from "../../engine/util/XRCubeCamera"
import { renderer } from "../../engine/renderer"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const vs_default = require('../../shaders/vs_defaultVertex.glsl');
const vs_clouds = require('../../shaders/vs_clouds.glsl');
const fs_clouds = require('../../shaders/fs_clouds.glsl');

import { Sky } from './sky.js';

export const scene = new Scene();

scene.init = () =>
{
    // networking refresh cleanup
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    // lovely clouds courtesy of @dghez from https://github.com/dghez/THREEJS_Procedural-clouds/
    // tutorial https://tympanus.net/codrops/2020/01/28/how-to-create-procedural-clouds-using-three-js-sprites/
    const t1 = ImageUtils.loadTexture("../assets/veraMolnar/clouds/1.jpg");
    const t2 = ImageUtils.loadTexture("../assets/veraMolnar/clouds/2.jpg");
    // t1.wrapS = RepeatWrapping;
    // t1.repeat.set(100, 100);
    // t2.wrapS = RepeatWrapping;
    // t2.repeat.set(100, 100);

    const cloudUniforms = {
        uTime: { value: 0 },
        uTxtShape: { value: t1 },
        uTxtCloudNoise: { value: t2 },
        uFac1: { value: 17.8 },
        uFac2: { value: 2.7 },
        uTimeFactor1: { value: 0.002, },
        uTimeFactor2: { value: 0.0015 },
        uDisplStrenght1: { value: 0.04 },
        uDisplStrenght2: { value: 0.08 }
    };



    const cloudMat = new ShaderMaterial({
        uniforms: cloudUniforms,
        vertexShader: vs_default,
        fragmentShader: fs_clouds,
        transparent: true
    })
    const cloudGeo = new PlaneBufferGeometry(1000.0, 1000.0, 5, 5);
    const cloudMesh = new Mesh(cloudGeo, cloudMat);
    cloudMesh.position.set(0, 400.3, 0);
    cloudMesh.rotateOnAxis(new Vector3(1, 0, 0), 1.57079632679);
    scene.add(cloudMesh);

    // const c2 = cloudMesh.clone();
    // c2.position.set(3000, 1714, 30000);
    // scene.add(c2);

    var fog = new Fog(0x4584b4, - 100, 3000);


    //sky, light

    const light = new DirectionalLight(0xffffff, 0.8);
    scene.add(light);
    const sky = new Sky();
    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = 10;
    uniforms[ 'rayleigh' ].value = 2;
    uniforms[ 'luminance' ].value = 1;
    uniforms[ 'mieCoefficient' ].value = 0.005;
    uniforms[ 'mieDirectionalG' ].value = 0.8;

    const cubeCamera = new XRCubeCamera(0.1, 1, 512);
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

    const empty = new Object3D();
    empty.Update = () =>
    {
        // day/night cycle
        // long nights are boring
        parameters.inclination = parameters.inclination <= -0.55000 ? 0.55 : parameters.inclination - 0.00025;
        sunTheta = Math.PI * (parameters.inclination - 0.5);
        sunPhi = 2 * Math.PI * (parameters.azimuth - 0.5);
        light.position.x = parameters.distance * Math.cos(sunPhi);
        light.position.y = parameters.distance * Math.sin(sunPhi) * Math.sin(sunTheta);
        light.position.z = parameters.distance * Math.sin(sunPhi) * Math.cos(sunTheta);
        sky.material.uniforms[ 'sunPosition' ].value = light.position.copy(light.position);
        cubeCamera.update(renderer, sky);

        cloudMat.uniforms.uTime.value += 1;
        cloudMat.uniforms.uTxtCloudNoise.value = t2;
        cloudMat.uniforms.uTxtShape.value = t1;
    };
    scene.add(empty);
}
scene.init();