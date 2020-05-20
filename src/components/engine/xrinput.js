import { state } from "./state"
import { renderer } from './renderer';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

const controllerModelFactory = new XRControllerModelFactory();
let ctrlArr = [];

window.addEventListener("gamepadconnected", function (e)
{
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
});

// trigger start
const onSelectStart = (e) =>
{
    console.log("trigger pressed!");
}
// trigger end
const onSelectEnd = (e) =>
{
    console.log("trigger released!");
}
// trigger "event" (fully completed after release)
const onSelect = (e) =>
{
    console.log("select event completed!")
}

// side button start
const onSqueezeStart = (e) =>
{
    console.log("squeeze pressed!");
}

// side button end
const onSqueezeEnd = (e) =>
{
    console.log("squeeze released!");
}

// side button "event" (fully completed after release)
const onSqueeze = (e) =>
{
    console.log("squeeze event completed!")
}


const connectedCont = [];

for (let i = 0; i < 2; i++)
{
    ctrlArr[i] = renderer.xr.getControllerGrip(i);
    ctrlArr[i].add(controllerModelFactory.createControllerModel(ctrlArr[i]));
    ctrlArr[i].addEventListener('selectstart', onSelectStart);
    ctrlArr[i].addEventListener('selectend', onSelectEnd);
    ctrlArr[i].addEventListener('select', onSelect);
    ctrlArr[i].addEventListener('squeezestart', onSqueezeStart);
    ctrlArr[i].addEventListener('squeezeend', onSqueezeEnd);
    ctrlArr[i].addEventListener('squeeze', onSqueeze);

    ctrlArr[i].addEventListener('connected', (event) =>    
    {
        console.log("XR Controller " + i + " connected");
        connectedCont.push(ctrlArr[i]);
        state.hasXRInput = true;
    });
    ctrlArr[i].addEventListener('disconnected', (event) =>    
    {
        console.log("XR Controller " + i + " Disconnected");
        connectedCont.pop(ctrlArr[i]);

        if (connectedCont.length == 0) state.hasXRInput = false;
    });

}

export { ctrlArr }