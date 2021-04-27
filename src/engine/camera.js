import { PerspectiveCamera, Vector3, Quaternion } from "three";
import State from "./state";

class TrackingCamera extends PerspectiveCamera {
  constructor() {
    super(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    this.xrReferenceSpace = null;

    this.tempPos = new Vector3();
    this.tempQuat = new Quaternion();
    this.tempSca = new Vector3();

    this.startTime = 0;
    this.counter = 0;
    this.totalMS = 0;
    this.FRAMES_TO_COUNT = 300;
    this.doOnce = false;

    State.eventHandler.addEventListener("xrsessionstarted", session => {
      this.requestReferenceSpace(session);
      session.requestAnimationFrame(this.onXRAnimationFrame);
    });

    State.eventHandler.addEventListener("xrsessionended", () => {
      this.xrReferenceSpace = null;
      this.counter = 0;
      this.doOnce = false;
    });
  }

  requestReferenceSpace = session => {
    session.requestReferenceSpace("local").then(refSpace => {
      this.xrReferenceSpace = refSpace;
      ``;
    });
  };

  onXRAnimationFrame = (time, xrFrame) => {
    State.currentSession.requestAnimationFrame(this.onXRAnimationFrame);
    this.updateCameraPosition(xrFrame);
  };

  updateCameraPosition = xrFrame => {
    if (this.xrReferenceSpace == null) return;

    // Start test
    this.startTime = performance.now();

    // -------------------
    // // * xrReferenceSpace/getViewerPose method (A): Michael timed ~0.04ms average *
    // let viewerPose = xrFrame.getViewerPose(this.xrReferenceSpace);
    // // The transform is an object of type XRRigidTransform https://developer.mozilla.org/en-US/docs/Web/API/XRRigidTransform
    // const { position, orientation } = viewerPose.transform;

    // this.position.set(position.x, position.y, position.z);
    // this.quaternion.set(
    //   orientation.x,
    //   orientation.y,
    //   orientation.z,
    //   orientation.w
    // );
    // -------------------

    // -------------------
    // * matrix decomp method (B): Michael timed ~0.02ms average *
    this.matrixWorld.decompose(this.tempPos, this.tempQuat, this.tempSca);
    this.position.copy(this.tempPos);
    this.quaternion.copy(this.tempQuat);
    this.scale.copy(this.tempSca);
    // -------------------

    // end test
    if (this.counter <= this.FRAMES_TO_COUNT) {
      this.totalMS += performance.now() - this.startTime;
      this.counter++;
    } else {
      if (!this.doOnce) {
        console.warn(`average time: ${this.totalMS / this.FRAMES_TO_COUNT}`);
        this.doOnce = true;
        this.totalMS = 0;
        this.startTime = 0;
        this.counter = 0;
      }
    }
  };
}

const Camera = new TrackingCamera();

export default Camera;
