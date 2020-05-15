import RS from "./RemoteSync";
import PeerJSClient from "./PeerJSClient";

let testSphere;

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

    // PeerConnection.addLocalObject(screenCamera, { type: 'camera' });

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
    // scene.createTestSphere();
    // scene.initGame();
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

function showMessage(str)
{
    console.log(str);
}

export { PeerConnection }