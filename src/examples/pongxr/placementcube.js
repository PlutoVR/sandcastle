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

const PlacementCube = () => {
  const c = new Clock();
  // fix for world cam dir querying
  let forwardOffset = new Vector3();
  let CamForward = new Vector3();
  let empty = new Object3D();
  Camera.add(empty);
  const placementCubeInstance = new Mesh(
    new BoxBufferGeometry(2, 2, 4, 8, 8, 16),
    new MeshBasicMaterial({
      color: new Color("rgb(0, 255, 0)"),
      wireframe: true,
    })
  );

  placementCubeInstance.Update = function () {
    this.material.color.g = Math.cos(c.getElapsedTime() * 5) / 2 + 0.5;
    this.position.add(forwardOffset);
    if (State.isMaster && XRInput.inputSources != null) {
      XRInput.inputSources.forEach((e, i) => {
        e.gamepad.axes.forEach((axis, axisIndex) => {
          if (axis != 0) {
            if (axisIndex % 2 == 0) {
              // X
              if (Math.abs(axis) > 0.5)
                this.rotation.y += axis > 0 ? -0.01 : 0.01;
            } // Y
            else {
              XRInput.controllerGrips[i].getWorldDirection(CamForward);
              forwardOffset = CamForward.multiplyScalar(
                axis > 0 ? 0.02 : -0.02
              );
              this.position.add(forwardOffset);
              forwardOffset.x = forwardOffset.y = forwardOffset.z = 0;
            }
            this.position.y = XRInput.controllerGrips[0].position.y;
          }
        });
      });
    }
  };
  return placementCubeInstance;
};

export default PlacementCube;
