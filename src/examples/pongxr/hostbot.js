import Speech from 'speak-tts'

class HostBot
{
    constructor(networking)
    {
        this.speech = new Speech();
        this.networking = networking;
        this.scene = networking.scene;
        this.speech.init({
            'volume': 1,
            'lang': 'en-US',
            'rate': 1,
            'pitch': 1,
            'voice': 'Microsoft Zira Desktop - English (United States)',
            'splitSentences': true,
        }).then((data) =>
        {
            // The "data" object contains the list of available voices and the voice synthesis params
            console.log("Speech is ready, voices are available", data)
        }).catch(e =>
        {
            console.error("An error occured while initializing : ", e)
        });
        this.networking.remoteSync.addEventListener('open', this.onOpen.bind(this));
        this.networking.remoteSync.addEventListener('close', this.onClose.bind(this));
        this.networking.remoteSync.addEventListener('error', this.onError.bind(this));
        this.networking.remoteSync.addEventListener('connect', this.onConnect.bind(this));
        this.networking.remoteSync.addEventListener('disconnect', this.onDisconnect.bind(this));
        // this.networking.remoteSync.addEventListener('receive', this.onReceive.bind(this));
        // this.networking.remoteSync.addEventListener('add', this.onAdd.bind(this));
        // this.networking.remoteSync.addEventListener('remove', this.onRemove.bind(this));
    }

    onOpen()
    {
        this.speech.speak({ text: "Signaling server connection opened!" });
    }
    onClose()
    {
        this.speech.speak({ text: "Disconnected from signaling server!" });
    }
    onConnect()
    {
        this.speech.speak({ text: "A new player has joined!" });
    }

    onDisconnect()
    {
        this.speech.speak({ text: "Player disconnected!" });
    }
    onError(e)
    {
        console.log(e);
        const errorMsg = "Error!" + e.error.message;
        this.speech.speak({ text: errorMsg });
    }


}

export default HostBot;