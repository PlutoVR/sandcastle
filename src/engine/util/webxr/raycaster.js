import {
  Raycaster,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Matrix4,
} from "three";
export default class SCRaycaster extends Raycaster {
  constructor(
    originObject,
    target,
    direction = new Vector3(0, 0, -1),
    isRecursive = true,
    near = 0.1,
    far = 10
  ) {
    super();

    if (!originObject.parent || originObject.parent.type != "Scene") {
      throw new Error("Error: the raycasting object is not in the scene!");
    }

    this._tempMatrix = new Matrix4();
    this._originObject = originObject;
    this._target = target;
    this._direction = direction;
    this._isRecursive = isRecursive;
    this._near = near;
    this._far = far;
    this._visualizedRaycast = undefined;
    this._isTargetArray = Array.isArray(this._target); // cache check because it will impact every frame
    this._isTargetBox3 = this._target.isBox3;
  }
  getIntersections() {
    this._tempMatrix.identity().extractRotation(this._originObject.matrixWorld);
    this.ray.origin.setFromMatrixPosition(this._originObject.matrixWorld);
    this.ray.direction.set(0, 0, -1).applyMatrix4(this._tempMatrix);

    return this._isTargetBox3
      ? this.ray.intersectsBox(this._target)
      : this._isTargetArray
      ? this.intersectObjects(this._target, this._isRecursive)
      : this.intersectObject(this._target, this._isRecursive);
  }

  visualize(color = "0xffffff", onlyWhenHit = false) {
    const lineGeo = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -1),
    ]);
    const colorValue = parseInt(color.replace("#", "0x"), 16);
    const lineMat = new LineBasicMaterial({ color: colorValue });
    this._visualizedRaycast = new Line(lineGeo, lineMat);
    this._visualizedRaycast.name = "line";

    if (onlyWhenHit) {
      this._visualizedRaycast.Update = () => {
        this._visualizedRaycast.visible =
          this.getIntersections().length > 0 || this.getIntersections() == true;
      };
    }
    this._originObject.add(this._visualizedRaycast);
  }
}
