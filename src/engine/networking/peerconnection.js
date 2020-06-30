import RS from "./remotesync";
import State from "../state";
import { Object3D } from "three";
import FirebaseSignalingServer from "./firebasesignalingserver";
import WebRTCClient from "./webrtcclient";

class PeerConnection {
  constructor(scene, stream) {
    this.scene = scene;
    // assign random id to URL
    if (location.href.indexOf("?") === -1) {
      location.href += "?" + ((Math.random() * 10000) | 0);
    }

    this.remoteSync = new RS.RemoteSync(
      new WebRTCClient(
        new FirebaseSignalingServer({
          authType: "none",
          apiKey: "AIzaSyBu6M0W3iBAWPLIkW5L3ixr7io2IQZxQOA",
          authDomain: "sandcastle-e07df.firebaseapp.com",
          databaseURL: "https://sandcastle-e07df.firebaseio.com",
        }),
        { stream: stream }
      )
    );
    this.remoteSync.addEventListener("open", this.onOpen.bind(this));
    this.remoteSync.addEventListener("close", this.onClose.bind(this));
    this.remoteSync.addEventListener("error", this.onError.bind(this));
    this.remoteSync.addEventListener("connect", this.onConnect.bind(this));
    this.remoteSync.addEventListener(
      "disconnect",
      this.onDisconnect.bind(this)
    );
    this.remoteSync.addEventListener("receive", this.onReceive.bind(this));
    this.remoteSync.addEventListener("add", this.onAdd.bind(this));
    this.remoteSync.addEventListener("remove", this.onRemove.bind(this));
    this.remoteSync.addEventListener("master", this.onPrimary.bind(this));
    this.remoteSync.addEventListener("slave", this.onSecondary.bind(this));

    //add networking update method
    const networkingUpdate = new Object3D();
    networkingUpdate.Update = () => {
      this.remoteSync.sync();
    };
    this.scene.add(networkingUpdate);
  }

  onOpen(id) {
    this.clientId = id;
    const link = location.href;
    const a = document.createElement("a");
    a.target = "_blank";
    a.setAttribute("href", link);
    a.setAttribute("target", "_blank");
    a.innerHTML = link;
    document.querySelector(".info").appendChild(a);
    this.connectFromURL();
    State.eventHandler.dispatchEvent("peerconnected");
  }

  onReceive(data) {
    // console.log("OnReceive")
    // console.log(data);
  }

  onPrimary(data) {
    State.isPrimary = true;
  }

  onSecondary(data) {
    State.isPrimary = false;
  }

  onAdd(destId, objectId, info) {
    if (State.debugMode) {
      console.log("onAdd: adding " + objectId);
      console.log(info);
    }
  }

  onRemove(destId, objectId, object) {
    if (State.debugMode) {
      console.log("onRemove: removing " + objectId);
      console.log(object);
    }
    if (object.parent !== null) object.parent.remove(object);
  }

  onClose(destId) {
    if (State.debugMode) console.log("Disconnected to " + destId);
  }

  onError(error) {
    console.error(error);
  }

  onConnect(destId) {
    if (State.debugMode) console.log("onConnect: Connected with " + destId);
  }

  onDisconnect(destId, object) {
    if (State.debugMode) console.log("Disconnected with " + destId);
  }

  connect(id) {
    if (id === this.clientId) {
      if (State.debugMode) console.log(id + " is your id");
      return;
    }
    if (State.debugMode) console.log("Connecting with " + id);
    this.remoteSync.connect(id);
  }

  connectFromURL() {
    const url = location.href;
    const index = url.indexOf("?");
    if (index >= 0) {
      const id = url.slice(index + 1);
      this.connect(id);
    }
  }
}

export default PeerConnection;
