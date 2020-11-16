import { PerspectiveCamera } from "three";

const Camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

export default Camera;
