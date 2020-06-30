import {
  MeshBasicMaterial,
  BoxBufferGeometry,
  Color,
  Clock,
  Vector3,
  Mesh,
  Object3D,
} from "three";
import { Camera } from "../../engine/engine";
import State from "../../engine/state";
import XRInput from "../../engine/xrinput";

class PlacementCube extends Mesh {
  constructor(params) {
    super(params);

    this.c = new Clock();

    // fix for world cam dir querying
    this.forwardOffset = new Vector3();
    this.CamForward = new Vector3();
    let empty = new Object3D();
    Camera.add(empty);

    const pCubeGeo = new BoxBufferGeometry(2, 2, 4, 8, 8, 16);
    const pCubeMat = new MeshBasicMaterial({
      color: new Color("rgb(0, 255, 0)"),
      wireframe: true,
    });

    this.geometry = pCubeGeo;
    this.material = pCubeMat;
  }
  Update() {
    this.material.color.g = Math.cos(this.c.getElapsedTime() * 5) / 2 + 0.5;
    this.position.add(this.forwardOffset);
    if (State.isPrimary && XRInput.inputSources != null) {
      XRInput.inputSources.forEach((e, i) => {
        e.gamepad.axes.forEach((axis, axisIndex) => {
          if (axis != 0) {
            if (axisIndex % 2 == 0) {
              // X
              if (Math.abs(axis) > 0.5)
                this.rotation.y += axis > 0 ? -0.01 : 0.01;
            } // Y
            else {
              XRInput.controllerGrips[i].getWorldDirection(this.CamForward);
              this.forwardOffset = this.CamForward.multiplyScalar(
                axis > 0 ? 0.02 : -0.02
              );
              this.position.add(this.forwardOffset);
              this.forwardOffset.x = this.forwardOffset.y = this.forwardOffset.z = 0;
            }
            this.position.y = XRInput.controllerGrips[0].position.y;
          }
        });
      });
    }
  }
}

export default PlacementCube;
