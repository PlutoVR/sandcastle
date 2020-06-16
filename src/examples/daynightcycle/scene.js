// Day/night sycle, atmosphere, advanced noise-based cloud shader
// TODO: refactor to glslify

import {
  Scene,
  Object3D,
  DirectionalLight,
  WebGLCubeRenderTarget,
  CubeCamera,
  RGBAFormat,
  LinearMipmapLinearFilter,
} from "three";
import { Renderer } from "../../engine/renderer";
import { XRInput } from "../../engine/xrinput";

import { Cloud } from "./cloud";
import { Sky } from "./sky.js";

export const scene = new Scene();

scene.init = () => {
  const cloud = new Cloud();
  cloud.position.set(40, 40, -255);
  scene.add(cloud);

  //sky, light
  const light = new DirectionalLight(0xffffff, 0.8);
  scene.add(light);
  const sky = new Sky();
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = 10;
  uniforms["rayleigh"].value = 2;
  uniforms["luminance"].value = 1;
  uniforms["mieCoefficient"].value = 0.005;
  uniforms["mieDirectionalG"].value = 0.8;

  const cubeRenderTarget = new WebGLCubeRenderTarget(512, {
    format: RGBAFormat,
    generateMipmaps: true,
    minFilter: LinearMipmapLinearFilter,
  });

  const cubeCamera = new CubeCamera(0.1, 1000, cubeRenderTarget);
  cubeCamera.renderTarget.texture.generateMipmaps = true;
  cubeCamera.renderTarget.texture.minFilter = LinearMipmapLinearFilter;
  scene.background = cubeCamera.renderTarget;

  XRInput.onSelect = e => {
    scene.background == cubeCamera.renderTarget
      ? (scene.background = null)
      : (scene.background = cubeCamera.renderTarget);
  };

  const parameters = {
    distance: 400,
    inclination: 0.49,
    azimuth: 0.205,
  };
  let sunTheta = Math.PI * (parameters.inclination - 0.5);
  let sunPhi = 2 * Math.PI * (parameters.azimuth - 0.5);

  const rAF = new Object3D();
  rAF.Update = () => {
    // day/night cycle
    // long nights are boring
    parameters.inclination =
      parameters.inclination <= -0.55 ? 0.55 : parameters.inclination - 0.00025;
    sunTheta = Math.PI * (parameters.inclination - 0.5);
    sunPhi = 2 * Math.PI * (parameters.azimuth - 0.5);
    light.position.x = parameters.distance * Math.cos(sunPhi);
    light.position.y =
      parameters.distance * Math.sin(sunPhi) * Math.sin(sunTheta);
    light.position.z =
      parameters.distance * Math.sin(sunPhi) * Math.cos(sunTheta);
    sky.material.uniforms["sunPosition"].value = light.position.copy(
      light.position
    );
    cubeCamera.update(Renderer, sky);
  };
  scene.add(rAF);
};
scene.init();
