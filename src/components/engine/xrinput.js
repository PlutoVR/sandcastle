import { state } from "./state"
import { renderer } from './renderer';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

const controllerModelFactory = new XRControllerModelFactory();

class XRInputClass
{
    // trigger start
    onSelectStart(e)
    {
        console.log("select started!");
    }
    // trigger end
    onSelectEnd(e)
    {
        console.log("select ended!");
    }

    // trigger "event" (fully completed after release)
    onSelect(e) 
    {
        console.log("select event!")
    }

    // side button start
    onSqueezeStart(e)
    {
        console.log("squeeze pressed!");
    }

    // side button end
    onSqueezeEnd(e)
    {
        console.log("squeeze released!");
    }

    // side button "event" (fully completed after release)
    onSqueeze(e)
    {
        console.log("squeeze event completed!")
    }

    // controller connection
    onConnected(e)
    {
        console.log("onConnected");
        state.controllers.push(e.data);
    }

    // controller disconnection
    onDisconnected(e)
    {
        console.log("onDisconnected");
        state.controllers = [];
    }
    Update()
    {
        this.debugOutput();
    }
    debugOutput()
    {
        this.inputDebugString = "";
        state.controllers.forEach((e) =>
        {
            e.gamepad.buttons.forEach((f, i) =>
            {
                if (f.pressed == true)
                {
                    this.inputDebugString += (e.handedness + " controller button " + i + "\n");
                    this.inputDebugString += ("value: " + f.value + "\n");
                }
            });

            // axes 0 and 1 unused at least on the quest
            if (e.gamepad.axes[ 2 ] != 0 || e.gamepad.axes[ 3 ] != 0)
            {
                this.inputDebugString += e.handedness + " joystick:\n";
                this.inputDebugString += "x: " + e.gamepad.axes[ 2 ] + "\n";
                this.inputDebugString += "y: " + e.gamepad.axes[ 3 ] + "\n";
            }
        });

        return this.inputDebugString == "" ? 0 : console.log(this.inputDebugString);
    }
}

//xrInput singleton
const XRInput = new XRInputClass();

// init input on XR session start
state.eventHandler.addEventListener("xrsessionstarted", (e) =>
{
    console.warn("xr session started");
    state.currentSession = e;
    state.xrSession = true;

    //buggy on MC? Should replace arbitrary "2"
    // const s = renderer.xr.getSession();
    // console.log(s.inputSources);
    for (let i = 0; i < 2; i++)
    {
        const c = renderer.xr.getController(i);
        c.addEventListener('selectend', XRInput.onSelectEnd);
        c.addEventListener('selectstart', XRInput.onSelectStart);
        c.addEventListener('select', XRInput.onSelect);
        c.addEventListener('squeezestart', XRInput.onSqueezeStart);
        c.addEventListener('squeezeend', XRInput.onSqueezeEnd);
        c.addEventListener('connected', XRInput.onConnected);
        c.addEventListener('disconnected', XRInput.onDisconnected);
    }
});

state.eventHandler.addEventListener("xrsessionended", () =>
{
    console.warn("xr session ended");
    state.inXR = false;
});

export { XRInput }