import { PerspectiveCamera } from "three";
import State from "./state";

class TrackingCamera extends PerspectiveCamera {
  constructor() {
    super(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  }

  Update() {
    if (!State.isXRSession) return;
    this.matrixWorld.decompose(this.position, this.quaternion, this.scale);
  }
}

const Camera = new TrackingCamera();

export default Camera;
