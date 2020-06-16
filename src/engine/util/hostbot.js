import Speech from "speak-tts";
import State from "../state";

const messageType = { log: 1, warn: 2, error: 3 };

class HostBot {
  constructor(networking) {
    this.speech = new Speech();
    this.networking = networking;
    this.scene = networking.scene;
    this.speech
      .init({
        volume: 1,
        lang: "en-US",
        rate: 1,
        pitch: 1,
        voice: "Microsoft Zira Desktop - English (United States)",
        splitSentences: true,
      })
      .then(data => {})
      .catch(e => {
        console.error("An error occured while initializing : ", e);
      });
    this.networking.remoteSync.addEventListener("open", this.onOpen.bind(this));
    this.networking.remoteSync.addEventListener(
      "close",
      this.onClose.bind(this)
    );
    this.networking.remoteSync.addEventListener(
      "error",
      this.onError.bind(this)
    );
    this.networking.remoteSync.addEventListener(
      "connect",
      this.onConnect.bind(this)
    );
    this.networking.remoteSync.addEventListener(
      "disconnect",
      this.onDisconnect.bind(this)
    );
    if (State.debugMode) console.log("HostBot ready");
    // this.networking.remoteSync.addEventListener('receive', this.onReceive.bind(this));
    // this.networking.remoteSync.addEventListener('add', this.onAdd.bind(this));
    // this.networking.remoteSync.addEventListener('remove', this.onRemove.bind(this));
  }

  onOpen() {
    // this.log("Connected to Signaling server", messageType.log);
  }
  onClose() {
    this.log("Disconnected from Signaling server", messageType.log);
  }
  onConnect() {
    this.log("A new player has joined!", messageType.log);
  }

  onDisconnect() {
    this.log("Player disconnected!", messageType.log);
  }
  onError(e) {
    const errorMsg = "Error!" + e.error.message;
    this.log(errorMsg, messageType.error);
  }

  log(message, type) {
    this.speech.speak({ text: message });
    if (!State.debugMode) return;

    switch (type) {
      default:
      case messageType.log:
        console.log(message);
        break;

      case messageType.warn:
        console.warn(message);
        break;

      case messageType.error:
        console.error(message);
        break;
    }
  }
}

export default HostBot;
