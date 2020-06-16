import { WebGLRenderer } from "three";

const Renderer = new WebGLRenderer({ antialias: true, alpha: true });
Renderer.setPixelRatio(window.devicePixelRatio);
Renderer.setSize(window.innerWidth, window.innerHeight);
Renderer.setClearColor(0x000000, 0.0);
Renderer.sortObjects = false;
Renderer.physicallyCorrectLights = true;
Renderer.xr.enabled = true;

export default Renderer;
