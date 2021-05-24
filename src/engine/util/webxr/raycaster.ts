import {
  Raycaster,
  Vector3,
  BufferGeometry,
  LineBasicMaterial,
  Line,
  Matrix4,
} from "three";

/** ThreeJS Line, extended with an Update method */
class SCLine extends Line {
  constructor(
    bufferGeo: THREE.BufferGeometry,
    material: THREE.LineBasicMaterial
  ) {
    super(bufferGeo, material);
  }
  Update(): void {}
}

/**
 * Sandcastle's own Raycaster; WebXR-friendly syntactic sugar over threeJS's Raycaster
 * @extends Raycaster
 */
export class SCRaycaster extends Raycaster {
  _originObject: THREE.Mesh | THREE.Group;
  _target: THREE.Mesh | Array<THREE.Mesh> | THREE.Box3;
  _direction: THREE.Vector3;
  _isRecursive: boolean;
  _near: number;
  _far: number;
  _visualizedRaycast: THREE.Line | undefined;
  _isTargetArray: boolean;
  _isTargetBox3: boolean;
  _tempMatrix: THREE.Matrix4;
  /**
   * Construct a Sandcastle Raycaster.
   * @param originObject - object to raycast from
   * @param target - object(s) to raycast to. Can be a mesh, a mesh array or a Box3.
   * @param [direction] - The normalized direction vector that gives direction to the ray.
   * @param [isRecursive] -  If true, it also checks all descendants. Otherwise it only checks intersection with the object. Default is true.
   * @param [near] - All results returned are further away than near. Near can't be negative. Default value is 0.1.
   * @param [far] - All results returned are closer than far. Far can't be lower than near. Default value is 10.
   */
  constructor(
    originObject: THREE.Mesh | THREE.Group,
    target: THREE.Mesh | Array<THREE.Mesh> | THREE.Box3, // due to original polymorphism in THREE.Raycaster(), see below
    direction: THREE.Vector3 = new Vector3(0, 0, -1),
    isRecursive: boolean = true,
    near: number = 0.1,
    far: number = 10
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
    this._isTargetBox3 = this._target.hasOwnProperty("isBox3");
  }

  /** get intersections of origin object with target object or array.
   * Usually run within the update loop or as the result of an event.
   * Will return a bool if intersects against a Box3, and an array if intersecting against scene objects.
   * */
  getIntersections(): any {
    this._tempMatrix.identity().extractRotation(this._originObject.matrixWorld);
    this.ray.origin.setFromMatrixPosition(this._originObject.matrixWorld);
    this.ray.direction.set(0, 0, -1).applyMatrix4(this._tempMatrix);

    return this._isTargetBox3
      ? this.ray.intersectsBox(this._target as THREE.Box3)
      : this._isTargetArray
      ? this.intersectObjects(this._target as [THREE.Mesh], this._isRecursive)
      : this.intersectObject(this._target as THREE.Mesh, this._isRecursive);
  }

  /**
   * a helper method for visualizing raycaster rays
   * @param color - visualizing ray color
   * @param onlyWhenHit - whether ray should be visualized only when a raycast hits the target or always
   */
  visualize(color = "0xffffff", onlyWhenHit = false): void {
    const lineGeo = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -1),
    ]);
    const colorValue = parseInt(color.replace("#", "0x"), 16);
    const lineMat = new LineBasicMaterial({ color: colorValue });
    const _visualizedRaycast = new SCLine(lineGeo, lineMat);
    _visualizedRaycast.name = "line";
    if (onlyWhenHit) {
      _visualizedRaycast.Update = () => {
        _visualizedRaycast.visible =
          this.getIntersections().length > 0 || this.getIntersections() == true;
      };
    }
    this._originObject.add(_visualizedRaycast);
  }
}
