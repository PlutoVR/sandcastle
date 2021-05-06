import { Group } from "three";
import State from "./state";
import Renderer from "./renderer";

class XRInputClass {
  constructor() {
    /** @deprecated Use `leftControllerGrip` or `rightControllerGrip` instead */
    this.controllerGrips = [];
    this.inputSources = null;

    this._leftController = new Group();
    this._leftControllerGrip = new Group();
    this._rightController = new Group();
    this._rightControllerGrip = new Group();
  }

  get hasInputSources() {
    return !!XRInput.inputSources;
  }

  /** A Group containing controller data for the left controller. Empty until XR session has started and there are input sources.
   *
   * Use {@link hasInputSources} [named of the method](file-name #hasInputSources) to determine when controller data is provided.
   */
  get leftController() {
    return this._leftController;
  }

  get leftControllerGrip() {
    return this._leftControllerGrip;
  }

  /** A Group containing controller data for the right controller. Empty until the XR session has started and the input sources change. */
  get rightController() {
    return this._rightController;
  }

  get rightControllerGrip() {
    return this._rightControllerGrip;
  }

  // trigger start
  onSelectStart(e) {
    if (State.debugMode) {
      console.log("select started!");
      console.log(e);
    }
    State.eventHandler.dispatchEvent("selectstart", e);
  }

  // trigger end
  onSelectEnd(e) {
    if (State.debugMode) {
      console.log("select ended!");
      console.log(e);
    }
    State.eventHandler.dispatchEvent("selectend", e);
  }

  // trigger "event" (fully completed after release)
  onSelect(e) {
    if (State.debugMode) {
      console.log("select event!");
      console.log(e);
    }
    State.eventHandler.dispatchEvent("select", e);
  }

  // side button start
  onSqueezeStart(e) {
    if (State.debugMode) {
      console.log("squeeze pressed!");
      console.log(e);
    }
    State.eventHandler.dispatchEvent("squeezestart", e);
  }

  // side button end
  onSqueezeEnd(e) {
    if (State.debugMode) {
      console.log("squeeze released!");
      console.log(e);
    }
    State.eventHandler.dispatchEvent("squeezeend", e);
  }

  // side button "event" (fully completed after release)
  onSqueeze(e) {
    if (State.debugMode) {
      console.log("squeeze event!");
      console.log(e);
    }
    State.eventHandler.dispatchEvent("squeeze", e);
  }

  // controller connection
  onConnected(e) {
    if (State.debugMode) {
      console.log("Controller Connected");
      console.log(e.data);
    }
  }

  // controller disconnection
  onDisconnected(e) {
    if (State.debugMode) {
      console.log("Controller Disconnected");
      console.log(e.data);
    }
  }

  Update() {
    if (State.debugMode) this.debugOutput();
  }

  debugOutput() {
    if (this.inputSources == null) return;

    this.inputDebugString = "";
    this.inputSources.forEach(e => {
      if (e.gamepad == null) return;
      e.gamepad.buttons.forEach((button, i) => {
        if (button.pressed == true) {
          this.inputDebugString +=
            e.handedness + " controller button " + i + "\n";
          this.inputDebugString += "value: " + button.value + "\n";
        }
      });

      e.gamepad.axes.forEach((axis, axisIndex) => {
        if (axis != 0) {
          this.inputDebugString += e.handedness + " joystick:\n";

          // regardless of axis count, odds will be X, evens will be Y
          if (axisIndex % 2 == 0) {
            this.inputDebugString += "x: " + axis + "\n";
          } else {
            // Y (typically 1 or 3)
            this.inputDebugString += "y: " + axis + "\n";
          }
        }
      });
    });
    return this.inputDebugString == "" ? 0 : console.log(this.inputDebugString);
  }
}

//xrInput singleton
const XRInput = new XRInputClass();

// subscribe to input events on XR session start
State.eventHandler.addEventListener("xrsessionstarted", e => {
  InputSourcesChanged(e.inputSources);
  e.addEventListener("selectend", XRInput.onSelectEnd.bind(XRInput));
  e.addEventListener("selectstart", XRInput.onSelectStart.bind(XRInput));
  e.addEventListener("select", XRInput.onSelect.bind(XRInput));
  e.addEventListener("squeezestart", XRInput.onSqueezeStart.bind(XRInput));
  e.addEventListener("squeezeend", XRInput.onSqueezeEnd.bind(XRInput));
  e.addEventListener("squeeze", XRInput.onSqueeze.bind(XRInput));
  e.addEventListener("connected", XRInput.onConnected.bind(XRInput));
  e.addEventListener("disconnected", XRInput.onDisconnected.bind(XRInput));
});

State.eventHandler.addEventListener("inputsourceschange", e =>
  InputSourcesChanged(e.session.inputSources)
);

State.eventHandler.addEventListener("xrsessionended", () => {
  XRInput.controllerGrips = [];
  XRInput.inputSources = null;
  XRInput._leftController = new Group();
  XRInput._leftControllerGrip = new Group();
  XRInput._rightController = new Group();
  XRInput._rightControllerGrip = new Group();
});

const InputSourcesChanged = inputSources => {
  XRInput.controllerGrips = [];
  XRInput.inputSources = inputSources;

  XRInput.inputSources.forEach((inputSource, controllerIndex) => {
    let controller = Renderer.xr.getController(controllerIndex);
    let controllerGrip = Renderer.xr.getControllerGrip(controllerIndex);

    if (inputSource.handedness === "left") {
      XRInput._leftController = controller;
      XRInput._leftControllerGrip = controllerGrip;
    } else if (inputSource.handedness === "right") {
      XRInput._rightController = controller;
      XRInput._rightControllerGrip = controllerGrip;
    }
  });

  // metachromium-specific hack to fix nonconformance bug
  const isUserAgentMetachromium = navigator.userAgent.indexOf("Mchr") !== -1;
  const inputNum = isUserAgentMetachromium ? 2 : XRInput.inputSources.length;

  for (let i = 0; i < inputNum; i++) {
    if (
      isUserAgentMetachromium ||
      XRInput.inputSources[i].gripSpace != undefined
    ) {
      if (State.debugMode) console.log("adding controller grip " + i);
      XRInput.controllerGrips[i] = Renderer.xr.getControllerGrip(i);
    }
  }
};

export default XRInput;
