import { renderer } from './renderer';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';


// controllers
//trigger
const onSelectStart = (e) =>
{
    console.log("select start!");
    console.log(e);
}

const onSelectEnd = () => { }

const onSqueezeStart = (e) =>
{
    console.log("squeezestart!");
}
const onSqueezeEnd = () => { }

const onSqueeze = (e) =>
{
    console.log("squeeze!")
}

// controller1 = renderer.xr.getController(0);

// controller1.addEventListener('connected', (event) =>    
// {

//     // this.add(buildController(event.data));

// });

// controller1.addEventListener('disconnected', () =>
// {
//     // this.remove(this.children[0]);
// });

// controller2.addEventListener('connected', function (event)
// {
//     // this.add(buildController(event.data));
// });



const controllerModelFactory = new XRControllerModelFactory();

const controller1 = renderer.xr.getControllerGrip(0);
controller1.add(controllerModelFactory.createControllerModel(controller1));
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
// controller1.addEventListener('squeezestart', onSqueezeStart);
// controller1.addEventListener('squeezeend', onSqueezeEnd);
// controller1.addEventListener('squeeze', onSqueeze);

const controller2 = renderer.xr.getControllerGrip(1);
controller2.add(controllerModelFactory.createControllerModel(controller2));
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);
// controller2.addEventListener('squeezestart', onSqueezeStart);
// controller2.addEventListener('squeezeend', onSqueezeEnd);
// controller2.addEventListener('squeeze', onSqueeze);

console.log("XR Controllers Loaded");


function handleController(controller)
{

}

export { controller1, controller2 }