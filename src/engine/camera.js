import { PerspectiveCamera } from "three";
import State from "./state";

class TrackingCamera extends PerspectiveCamera {
  constructor() {
    super(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    this.xrReferenceSpace = null;

    State.eventHandler.addEventListener("xrsessionstarted", session => {
      this.requestReferenceSpace(session);
      session.requestAnimationFrame(this.onXRAnimationFrame);
    });

    State.eventHandler.addEventListener("xrsessionended", () => {
      this.xrReferenceSpace = null;
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
    let viewerPose = xrFrame.getViewerPose(this.xrReferenceSpace);
    // The transform is an object of type XRRigidTransform https://developer.mozilla.org/en-US/docs/Web/API/XRRigidTransform
    const { position, orientation } = viewerPose.transform;

    this.position.set(position.x, position.y, position.z);
    this.quaternion.set(
      orientation.x,
      orientation.y,
      orientation.z,
      orientation.w
    );
  };
}

const Camera = new TrackingCamera();

export default Camera;
