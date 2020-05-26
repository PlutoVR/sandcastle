import { Scene, Object3D, Vector3, DirectionalLight, ShaderMaterial, Mesh, Fog, FogExp2, TextureLoader, LinearMipmapLinearFilter, PlaneBufferGeometry } from "three";
import { XRCubeCamera } from "../../engine/util/XRCubeCamera"
import { renderer } from "../../engine/renderer"
import { XRInput } from "../../engine/xrinput"

import { Cloud } from "./cloud";

import { Sky } from './sky.js';

export const scene = new Scene();

scene.init = () =>
{
    // networking refresh cleanup
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    const cloud = new Cloud();
    scene.add(cloud);

    // scene.fog =  new Fog(0x4584b4, 1, 3000);
    // const color = 0xFF00FF;
    // const density = 0.9;
    // scene.fog = new FogExp2(color, density);
    // scene.fog =  new Fog(0xff00ff, 1, 200);

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

    XRInput.onSelect = (e) =>
    {
        scene.background == cubeCamera.renderTarget ? scene.background = null : scene.background = cubeCamera.renderTarget;
    }


    const parameters = {
        distance: 400,
        inclination: 0.49,
        azimuth: 0.205
    };
    let sunTheta = Math.PI * (parameters.inclination - 0.5);
    let sunPhi = 2 * Math.PI * (parameters.azimuth - 0.5);

    const rAF = new Object3D();
    rAF.Update = () =>
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
    };
    scene.add(rAF);
}
scene.init();