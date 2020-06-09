import State from "./state"
import Renderer from './renderer';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

class XRInputClass
{
    constructor()
    {
        this.controllerGrips = [];
        this.inputSources = null;
        this.controllerModelFactory = new XRControllerModelFactory();
    }

    // trigger start
    onSelectStart(e)
    {
        if (State.debugMode)
        {
            console.log("select started!");
            console.log(e);
        }
        State.eventHandler.dispatchEvent("selectstart");
    }

    // trigger end
    onSelectEnd(e)
    {
        if (State.debugMode)
        {
            console.log("select ended!");
            console.log(e);
        }
        State.eventHandler.dispatchEvent("selectend");
    }

    // trigger "event" (fully completed after release)
    onSelect(e) 
    {
        if (State.debugMode)
        {
            console.log("select event!");
            console.log(e);
        }
        State.eventHandler.dispatchEvent("select");
    }

    // side button start
    onSqueezeStart(e)
    {
        if (State.debugMode)
        {
            console.log("squeeze pressed!");
            console.log(e);
        }
        State.eventHandler.dispatchEvent("squeezestart");
    }

    // side button end
    onSqueezeEnd(e)
    {
        if (State.debugMode)
        {
            console.log("squeeze released!");
            console.log(e);
        }
        State.eventHandler.dispatchEvent("squeezeend");
    }

    // side button "event" (fully completed after release)
    onSqueeze(e)
    {
        if (State.debugMode)
        {
            console.log("squeeze event completed!");
            console.log(e);
        }
        State.eventHandler.dispatchEvent("squeeze");
    }

    // controller connection
    onConnected(e)
    {
        if (State.debugMode)
        {
            console.log("Controller Connected");
            console.log(e.data);
        }
    }

    // controller disconnection
    onDisconnected(e)
    {
        if (State.debugMode)
        {
            console.log("Controller Disconnected");
            console.log(e.data);
        }
    }

    CreateControllerModel(controller, scene)
    {
        controller.add(this.controllerModelFactory.createControllerModel(controller));
        scene.add(controller);
    }

    Update()
    {
        if (State.debugMode)
        {
            if (this.inputSources != null) this.debugOutput();
        }
    }

    debugOutput()
    {
        this.inputDebugString = "";
        this.inputSources.forEach((e) =>
        {
            e.gamepad.buttons.forEach((button, i) =>
            {
                if (button.pressed == true)
                {
                    this.inputDebugString += (e.handedness + " controller button " + i + "\n");
                    this.inputDebugString += ("value: " + button.value + "\n");
                }
            });

            e.gamepad.axes.forEach((axis, axisIndex) =>
            {
                if (axis != 0)
                {
                    this.inputDebugString += e.handedness + " joystick:\n";

                    if (axisIndex % 2 == 0) // X (typically 0 or 2)
                    {
                        this.inputDebugString += "x: " + axis + "\n";
                    }
                    else // Y (typically be 1 or 3)
                    {
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

// init input on XR session start
State.eventHandler.addEventListener("xrsessionstarted", (e) =>
{
    if (State.debugMode) console.warn("xr session started");
    State.currentSession = e;
    State.isXRSession = true;

    e.addEventListener('selectend', XRInput.onSelectEnd.bind(XRInput));
    e.addEventListener('selectstart', XRInput.onSelectStart.bind(XRInput));
    e.addEventListener('select', XRInput.onSelect.bind(XRInput));
    e.addEventListener('squeezestart', XRInput.onSqueezeStart.bind(XRInput));
    e.addEventListener('squeezeend', XRInput.onSqueezeEnd.bind(XRInput));
    e.addEventListener('connected', XRInput.onConnected.bind(XRInput));
    e.addEventListener('disconnected', XRInput.onDisconnected.bind(XRInput));

    // console.log(Renderer.xr.getSession().inputSources)

});

State.eventHandler.addEventListener("inputsourceschange", (e) =>
{
    XRInput.inputSources = e.session.inputSources;
    const isUserAgentMetachromium = navigator.userAgent.indexOf("Mchr") !== -1;

    // metachromium-specific hack to fix nonconformance bug
    const inputNum = isUserAgentMetachromium !== -1 ? 2 : XRInput.inputSources.length
    for (let i = 0; i < inputNum; i++)
    {
        if (typeof (isUserAgentMetachromium || XRInput.inputSources[ i ].gripSpace) != undefined)
        {
            if (State.debugMode) console.log("adding controller grip " + i);
            XRInput.controllerGrips.push(Renderer.xr.getControllerGrip(i));
        }
    }
});

State.eventHandler.addEventListener("xrsessionended", () =>
{
    if (State.debugMode) console.warn("xr session ended");
    State.currentSession = null;
    State.isXRSession = false;
    XRInput.controllerGrips = [];
    XRInput.inputSources = null;
});

export default XRInput