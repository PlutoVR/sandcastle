import { WebGLRenderer } from "three";

export const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0.0);
renderer.sortObjects = false;
renderer.physicallyCorrectLights = true;
renderer.xr.enabled = true;