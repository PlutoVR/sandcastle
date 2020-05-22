import { state } from "./state"
import { renderer } from './renderer';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { Object3D } from "three";
const controllerModelFactory = new XRControllerModelFactory();

class XRInput
{
    constructor()
    {
        this.debugOutput = "";
    }
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
        // console.log(e.data);
    }

    // controller disconnection
    onDisconnected(e)
    {
        console.log("onDisconnected");
        state.controllers = [];
        // console.log(e.data);
    }
    updateControllers()
    {
        this.debugOutput = "";

        state.controllers.forEach((e) =>
        {
            // console.log(e);
            e.gamepad.buttons.forEach((f, i) =>
            {
                if (f.pressed == true)
                {

                    this.debugOutput += (e.handedness + " controller button " + i + "\n");
                    this.debugOutput += ("value: " + f.value + "\n");
                }
            });

            // unused at least on the quest
            // if (e.gamepad.axes[ 0 ] != 0)
            // {
            //     console.log("0 " + e.gamepad.axes[ 0 ]);
            // }
            // if (e.gamepad.axes[ 1 ] != 0)
            // {
            //     console.log("1 " + e.gamepad.axes[ 1 ]);
            // }


            if (e.gamepad.axes[ 2 ] != 0 || e.gamepad.axes[ 3 ] != 0)
            {
                this.debugOutput += e.handedness + " joystick:\n";
                this.debugOutput += "x: " + e.gamepad.axes[ 2 ] + "\n";
                this.debugOutput += "y: " + e.gamepad.axes[ 3 ] + "\n";
            }
            // e.gamepad.axes.forEach((g, i) =>
            // {
            //     if (g != 0)
            //     {
            //         console.log(e.handedness);
            //         console.log(g + "\n--------");
            //     }
            // });
        });

        if (this.debugOutput !== "") console.log(this.debugOutput);
    }
}

//xrInput singleton
export const xrInput = new XRInput();

// init input on XR session start
state.eventHandler.addEventListener("xrsessionstarted", (e) =>
{
    console.warn("xr session started");
    state.currentSession = e;
    state.xrSession = true;

    for (let i = 0; i < 2; i++)
    {
        const c = renderer.xr.getController(i);
        c.addEventListener('selectend', xrInput.onSelectEnd);
        c.addEventListener('selectstart', xrInput.onSelectStart);
        c.addEventListener('select', xrInput.onSelect);
        c.addEventListener('squeezestart', xrInput.onSqueezeStart);
        c.addEventListener('squeezeend', xrInput.onSqueezeEnd);
        c.addEventListener('connected', xrInput.onConnected);
        c.addEventListener('disconnected', xrInput.onDisconnected);
    }
});

state.eventHandler.addEventListener("xrsessionended", () =>
{
    console.warn("xr session ended");
    state.inXR = false;
});