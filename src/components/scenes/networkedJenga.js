import { state } from '../engine/state';
import { Scene, DirectionalLight, AxesHelper, Vector3, Euler, Object3D, Group, PerspectiveCamera, Quaternion, Position, Mesh, SphereGeometry, MeshNormalMaterial } from "three";


import Piece from '../assets/jengapiece-normalmat';
import { physics, rigidbodies } from '../engine/physics';
import { controller1, controller2 } from '../engine/xrinput';

import RS from "../engine/networking/RemoteSync";
import PeerJSClient from "../engine/networking/PeerJSClient";

let testSphere;


const screenCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
screenCamera.position.z = 13;

const scene = new Scene();

const ResetGame = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    const tower = new Group();
    for (let y = 1; y < 10; y++)
    {
        const level = new Group();
        for (let x = 0; x < 3; x++)
        {
            const piece = new Piece(new Vector3((-1 + x) / 2 + x * .01, y / 1.9, 0));
            level.add(piece);
        }
        if (y % 2 == 0) { level.rotateOnAxis(new Vector3(0, 1, 0), 1.5708); }
        tower.add(level);
        tower.children.forEach(e =>
        {
            level.children.forEach(e =>
            {
                //remove from groups due to physics constraints
                tower.attach(e);
                // if (!e.hasPhysics) return;
                physics.addBody(e, e.position, e.quaternion);
            });
        });
    }
    PeerConnection.addSharedObject(tower, '0');
    scene.add(tower);

    const axesHelper = new AxesHelper(5);
    scene.add(axesHelper)
    // const light = new THREE.DirectionalLight(0xffffff, 1.0);
    // scene.add(light);
    // physics.addTrigger(controller1);
    // physics.addTrigger(controller2);
    scene.add(controller1);
    scene.add(controller2);
}




//networking
let clientId;

const PeerConnection = new RS.RemoteSync(
    new PeerJSClient({
        // key: 'lwjd5qra8257b9',
        debugLevel: 0,
    })
);
PeerConnection.addEventListener('open', onOpen);
PeerConnection.addEventListener('close', onClose);
PeerConnection.addEventListener('error', onError);
PeerConnection.addEventListener('connect', onConnect);
PeerConnection.addEventListener('disconnect', onDisconnect);
PeerConnection.addEventListener('receive', onReceive);
PeerConnection.addEventListener('add', onAdd);
PeerConnection.addEventListener('remove', onRemove);


function onOpen(id)
{

    clientId = id;
    const link = window.location.href + "?" + id;
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('target', '_blank');
    a.innerHTML = link;
    document.querySelector(".info").appendChild(a);
    // document.getElementById('link').appendChild(createLink());

    PeerConnection.addLocalObject(screenCamera, { type: 'camera' });

    /*
        var box = createBox();
        box.position.y = -10;
        scene.add( box );
    
        transformControls.attach( box );
    
        PeerConnection.addLocalObject( box, { type: 'box' } );
    */

    // var sphere = createSphere();
    // sphere.position.y = -10;
    // scene.add(sphere);

    // transformControls.attach(sphere);

    // PeerConnection.addSharedObject(sphere, 0);

    // scene.add(transformControls);

    connectFromURL();

}

function onReceive(data)
{

}

window.addEventListener('keydown', e =>
{
    if (!testSphere) return;

    switch (e.keyCode)
    {
        case 87:
            testSphere.position.y += 0.05;
            break;
        case 65:
            testSphere.position.x -= 0.05;
            break;
        case 83:
            testSphere.position.y -= 0.05;
            break;
        case 68:
            testSphere.position.x += 0.05;
            break;
        default:
            break;

    }
});

function onAdd(destId, objectId, info)
{
    console.log("onAdd: connected to " + destId);

}

function onRemove(destId, objectId, object)
{
    if (object.parent !== null) object.parent.remove(object);

}


function onClose(destId)
{
    showMessage('Disconnected to ' + destId);
}

function onError(error)
{

    showMessage(error);

}

function onConnect(destId)
{

    showMessage('onConnect: Connected with ' + destId);

    // ResetGame();

    testSphere = new Mesh(new SphereGeometry(1.3, 16, 16), new MeshNormalMaterial);
    testSphere.position.set(0, 0, 1);
    PeerConnection.addSharedObject(testSphere, 11);
    scene.add(testSphere);

    // PeerConnection.addRemoteObject(destId, objectId, mesh);


}

function onDisconnect(destId, object)
{

    showMessage('Disconnected with ' + destId);

}

function connect(id)
{

    if (id === clientId)
    {

        showMessage(id + ' is your id');

        return;

    }

    var message = document.getElementById('message');

    showMessage('Connecting with ' + id);

    PeerConnection.connect(id);

}

function connectFromURL()
{

    var url = location.href;
    var index = url.indexOf('?');

    if (index >= 0)
    {

        var id = url.slice(index + 1);

        connect(id);

    }

}

function connectFromForm()
{

    var input = document.getElementById('dest_id');
    var id = input.value.trim();

    if (id === '') return;

    connect(id);

    input.value = '';

}

function showMessage(str)
{
    console.log(str);
}

export { scene, screenCamera, PeerConnection }