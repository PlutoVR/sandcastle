// lovely clouds courtesy of @dghez from https://github.com/dghez/Three.js_Procedural-clouds/
// tutorial https://tympanus.net/codrops/2020/01/28/how-to-create-procedural-clouds-using-three-js-sprites/

import {
  PlaneBufferGeometry,
  Mesh,
  ShaderMaterial,
  TextureLoader,
  Object3D,
} from "three";
const tl = new TextureLoader();
const vs_clouds = require("./assets/shaders/vs_clouds.glsl");
const fs_clouds = require("./assets/shaders/fs_clouds.glsl");
const cloud1 = require("./assets/textures/1.jpg");
const cloud2 = require("./assets/textures/2.jpg");

export class Cloud extends Object3D {
  constructor(params) {
    super(params);
    const t2 = tl.load(cloud2);
    const t1 = tl.load(cloud1);
    const cloudUniforms = {
      uTime: { value: 0 },
      uTxtShape: { value: t1 },
      uTxtCloudNoise: { value: t2 },
      uFac1: { value: 17.8 },
      uFac2: { value: 2.7 },
      uTimeFactor1: { value: 0.002 },
      uTimeFactor2: { value: 0.0015 },
      uDisplStrenght1: { value: 0.04 },
      uDisplStrenght2: { value: 0.08 },
    };

    const cloudMat = new ShaderMaterial({
      uniforms: cloudUniforms,
      vertexShader: vs_clouds,
      fragmentShader: fs_clouds,
      transparent: true,
      uTxtShape: t1,
      uTxtCloudNoise: t2,
    });

    const cloudGeo = new PlaneBufferGeometry(500.0, 500.0, 5, 5);
    const cloud = new Mesh(cloudGeo, cloudMat);
    cloud.Update = function () {
      cloud.material.uniforms.uTime.value += 1;
    };
    return cloud;
  }
}
