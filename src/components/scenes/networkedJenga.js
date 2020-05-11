import { state } from '../engine/state';
import { Scene, DirectionalLight, AxesHelper, Vector3, Euler, Object3D, PerspectiveCamera } from "three";

import Piece from '../assets/jengapiece-normalmat';
import { physics, rigidbodies } from '../engine/physics';
import { controller1, controller2 } from '../engine/xrinput';

import RemoteSync from "../engine/networking/RemoteSync";
import PeerJSClient from "../engine/networking/PeerJSClient";

const screenCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
screenCamera.position.z = 13;

const scene = new Scene();

const ResetGame = () =>
{
    scene.traverse(e =>
    {
        scene.remove(e);
    });

    const tower = new Object3D();
    for (let y = 1; y < 10; y++)
    {
        const group = new Object3D();
        for (let x = 0; x < 3; x++)
        {
            const piece = new Piece(new Vector3((-1 + x) / 2 + x * .01, y / 1.9, 0));
            group.add(piece);
        }
        if (y % 2 == 0) { group.setRotationFromAxisAngle(new Vector3(0, 1, 0), 1.5708); }
        tower.add(group);
    }
    // const tempPieces = [];
    // tower.traverse(e =>
    // {
    //     if (e.parent && e.parent.name == "group")
    //     {
    //         tempPieces.push(e);
    //     }
    // });
    // physics group bugfix
    // tempPieces.forEach(e => scene.attach(e));
    remoteSync.addSharedObject(tower, 0);
    scene.add(tower);
    // tower.position.x += 2;

    scene.traverse(e =>
    {
        if (e.hasPhysics) physics.addBody(e);
    });

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

const remoteSync = new RemoteSync.RemoteSync(
    new PeerJSClient({
        // key: 'lwjd5qra8257b9',
        debugLevel: 0,
    })
);
remoteSync.addEventListener('open', onOpen);
remoteSync.addEventListener('close', onClose);
remoteSync.addEventListener('error', onError);
remoteSync.addEventListener('connect', onConnect);
remoteSync.addEventListener('disconnect', onDisconnect);
remoteSync.addEventListener('receive', onReceive);
remoteSync.addEventListener('add', onAdd);
remoteSync.addEventListener('remove', onRemove);

function onOpen(id)
{

    clientId = id;

    console.log('your_id: ' + id);
    // document.getElementById('link').appendChild(createLink());

    remoteSync.addLocalObject(screenCamera, { type: 'camera' });

    /*
        var box = createBox();
        box.position.y = -10;
        scene.add( box );
    
        transformControls.attach( box );
    
        remoteSync.addLocalObject( box, { type: 'box' } );
    */

    // var sphere = createSphere();
    // sphere.position.y = -10;
    // scene.add(sphere);

    // transformControls.attach(sphere);

    // remoteSync.addSharedObject(sphere, 0);

    // scene.add(transformControls);

    connectFromURL();

}

function onReceive(data)
{

}

function onAdd(destId, objectId, info)
{
    console.log("users connected!");
    ResetGame();

    // var mesh;

    // switch (info.type)
    // {

    //     case 'camera':
    //         mesh = createModel(destId);
    //         break;

    //     case 'box':
    //         mesh = createBox();
    //         break;

    //     default:
    //         return;

    // }

    // scene.add(mesh);

    // remoteSync.addRemoteObject(destId, objectId, mesh);

}

function onRemove(destId, objectId, object)
{

    if (object.parent !== null) object.parent.remove(object);

}

function createLink()
{

    var a = document.createElement('a');

    var url = location.href;
    var index = url.indexOf('?');
    if (index >= 0) url = url.slice(0, index);

    a.href = url + '?' + clientId;
    a.text = 'Share this link';
    a.target = '_blank';

    return a;

}

function onClose(destId)
{

    showMessage('Disconnected with ' + destId);

}

function onError(error)
{

    showMessage(error);

}

function onConnect(destId)
{

    showMessage('Connected with ' + destId);

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

    remoteSync.connect(id);

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

    var message = document.getElementById('message');
    console.log(str);

}




// ---------------------------------------------------
///---------------------

export { scene, screenCamera }