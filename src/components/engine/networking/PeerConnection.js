import RS from "./RemoteSync";
import PeerJSClient from "./PeerJSClient";

export class SharedExperience
{
    constructor()
    {
        this.PeerConnection = new RS.RemoteSync(
            new PeerJSClient({
                debugLevel: 0,
            })
        );
        this.PeerConnection.addEventListener('open', this.onOpen.bind(this));
        this.PeerConnection.addEventListener('close', this.onClose.bind(this));
        this.PeerConnection.addEventListener('error', this.onError.bind(this));
        this.PeerConnection.addEventListener('connect', this.onConnect.bind(this));
        this.PeerConnection.addEventListener('disconnect', this.onDisconnect.bind(this));
        this.PeerConnection.addEventListener('receive', this.onReceive.bind(this));
        this.PeerConnection.addEventListener('add', this.onAdd.bind(this));
        this.PeerConnection.addEventListener('remove', this.onRemove.bind(this));
    }

    onOpen(id)
    {
        this.clientId = id;
        const link = window.location.href + "?" + id;
        const a = document.createElement('a');
        a.setAttribute('href', link);
        a.setAttribute('target', '_blank');
        a.innerHTML = link;
        document.querySelector(".info").appendChild(a);
        this.connectFromURL();
    }

    onReceive(data)
    {

    }

    onAdd(destId, objectId, info)
    {
        console.log("onAdd: connected to " + destId);
    }

    onRemove(destId, objectId, object)
    {
        if (object.parent !== null) object.parent.remove(object);
    }


    onClose(destId)
    {
        this.showMessage('Disconnected to ' + destId);
    }

    onError(error)
    {
        this.showMessage(error);
    }

    onConnect(destId)
    {
        this.showMessage('onConnect: Connected with ' + destId);
    }

    onDisconnect(destId, object)
    {
        this.showMessage('Disconnected with ' + destId);
    }

    connect(id)
    {
        if (id === this.clientId)
        {
            this.showMessage(id + ' is your id');
            return;
        }
        const message = document.getElementById('message');
        this.showMessage('Connecting with ' + id);
        this.PeerConnection.connect(id);
    }

    connectFromURL()
    {
        const url = location.href;
        const index = url.indexOf('?');
        if (index >= 0)
        {
            const id = url.slice(index + 1);
            this.PeerConnection.connect(id);
        }
    }

    showMessage(str) { console.log(str); }
}
