import { renderer } from './renderer';
import { scene } from '../scene';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

console.log(scene);
let controller1, controller2;


// controllers

onSelectStart = () =>
{
    this.userData.isSelecting = true;
}

onSelectEnd = () =>
{
    this.userData.isSelecting = false;
}

// controller1 = renderer.xr.getController(0);
// controller1.addEventListener('selectstart', onSelectStart);
// controller1.addEventListener('selectend', onSelectEnd);

// controller1.addEventListener('connected', (event) =>    
// {

//     // this.add(buildController(event.data));

// });

// controller1.addEventListener('disconnected', () =>
// {
//     // this.remove(this.children[0]);
// });

// scene.add(controller1);

// controller2 = renderer.xr.getController(1);

// controller2.addEventListener('selectstart', onSelectStart);
// controller2.addEventListener('selectend', onSelectEnd);

// controller2.addEventListener('connected', function (event)
// {
//     // this.add(buildController(event.data));
// });

// controller2.addEventListener('disconnected', function ()
// {
//     // this.remove(this.children[0]);
// });

// scene.add(controller2);

// The XRControllerModelFactory will automatically fetch controller models
// that match what the user is holding as closely as possible. The models
// should be attached to the object returned from getControllerGrip in
// order to match the orientation of the held device.

const controllerModelFactory = new XRControllerModelFactory();

controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
scene.add(controllerGrip2);

// function buildController(data)
// {

//     switch (data.targetRayMode)
//     {

//         case 'tracked-pointer':

//             var geometry = new THREE.BufferGeometry();
//             geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 1], 3));
//             geometry.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

//             var material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });

//             return new THREE.Line(geometry, material);

//         case 'gaze':

//             var geometry = new THREE.RingBufferGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
//             var material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
//             return new THREE.Mesh(geometry, material);

//     }

// }

function handleController(controller)
{

    if (controller.userData.isSelecting)
    {
        console.log("selecting!");
    }

}