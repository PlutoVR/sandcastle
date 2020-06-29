import { Vector3, Euler, Object3D } from "three";

class EngineEditorCamera extends Object3D {
  constructor(camera, domElement, params) {
    super(params);
    this.camera = camera;
    this.domElement = domElement;
    this.PI_2 = Math.PI / 2;
    this.euler = new Euler(0, 0, 0, "YXZ");
    this.vec = new Vector3();
    this.cameraForward = new Vector3();
    this._rcPressed = false;
    this.pressedKeyMap = {
      87: false, // w
      65: false, // a
      83: false, // s
      68: false, // d
      81: false, // q
      69: false, // e
      16: false, // shift
    };

    window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    window.addEventListener("mousedown", this.onMouseDown.bind(this), false);
    window.addEventListener("mouseup", this.onMouseUp.bind(this), false);
    window.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    window.addEventListener("wheel", this.onMouseWheel.bind(this), false);

    //disable rClick
    document.oncontextmenu = e => {
      if (e.preventDefault != undefined) e.preventDefault();
      if (e.stopPropagation != undefined) e.stopPropagation();
    };
    this.retrieveSessionData();
  }

  setSessionData() {
    this.editorCamState = {
      camSpeed: this.CAM_SPEED,
      cameraPosition: this.camera.position,
      cameraQuaternion: this.camera.quaternion,
    };
    window.sessionStorage.setItem(
      "camState",
      JSON.stringify(this.editorCamState)
    );
    // console.log("saving editor camera session data");
  }

  retrieveSessionData() {
    const camState = JSON.parse(window.sessionStorage.getItem("camState"));
    if (camState == null) {
      this.CAM_SPEED = 0.015;
      this.setSessionData();
      return;
    }

    this.CAM_SPEED = "camSpeed" in camState ? camState["camSpeed"] : 0.015;
    this.camera.position.copy(
      "cameraPosition" in camState ? camState["cameraPosition"] : new Vector3()
    );
    this.camera.applyQuaternion(
      "cameraQuaternion" in camState
        ? camState["cameraQuaternion"]
        : new Vector3()
    );
    // console.log("loading editor camera session data");
  }

  Update() {
    this.shiftSpeedMulti = this.pressedKeyMap[16] ? 2 : 1;
    if (this.pressedKeyMap[87])
      this.moveForward(this.CAM_SPEED * this.shiftSpeedMulti);
    if (this.pressedKeyMap[83])
      this.moveForward(-this.CAM_SPEED * this.shiftSpeedMulti);
    if (this.pressedKeyMap[69])
      this.moveUp(this.CAM_SPEED * this.shiftSpeedMulti);
    if (this.pressedKeyMap[81])
      this.moveUp(-this.CAM_SPEED * this.shiftSpeedMulti);
    if (this.pressedKeyMap[68])
      this.moveRight(this.CAM_SPEED * this.shiftSpeedMulti);
    if (this.pressedKeyMap[65])
      this.moveRight(-this.CAM_SPEED * this.shiftSpeedMulti);
  }

  onKeyDown(event) {
    this.pressedKeyMap[event.keyCode] = event.keyCode in this.pressedKeyMap;
  }

  onKeyUp(event) {
    this.pressedKeyMap[event.keyCode] = !(event.keyCode in this.pressedKeyMap);
  }

  onMouseDown(event) {
    if (event.button == 2) {
      this._rcPressed = true;
      this.domElement.requestPointerLock =
        this.domElement.requestPointerLock || domElement.mozRequestPointerLock;
      this.domElement.requestPointerLock();
    }
  }

  onMouseUp(event) {
    if (event.button == 2) {
      this._rcPressed = false;
      document.exitPointerLock();
      this.setSessionData();
    }
  }

  moveForward(distance) {
    this.camera.getWorldDirection(this.cameraForward);
    this.camera.position.addScaledVector(this.cameraForward, distance);
  }

  moveRight(distance) {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.vec, distance);
  }

  moveUp(distance) {
    this.camera.position.addScaledVector(this.camera.up, distance);
  }

  onMouseMove(event) {
    if (!this._rcPressed) return;
    const movementX =
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY =
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  onMouseWheel(event) {
    if (this._rcPressed)
      this.CAM_SPEED = Math.max(
        0.01,
        (this.CAM_SPEED -= event.deltaY * 0.0001)
      );
    else this.moveForward((this.CAM_SPEED * -event.deltaY) / 10);
  }
}

export default EngineEditorCamera;
