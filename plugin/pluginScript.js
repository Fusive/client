var videoPlayer;
var socketControl;



// Asset Class, All Other Classes Inherits This One
class socketAsset {

    // List Of The Asset Class Instances
    static assetList = [];

    // Class Constructor
    constructor(title, asset, duration) {
        this.title = title;
        this.asset = asset;
        this.duration = duration;
    }
}

// Video Class, Create Video Instances On assets.js
class socketVideo extends socketAsset {

    // Class Constructor
    constructor (title, asset, duration=null, volume=1, local=true) {
        super(title, asset, duration);
        this.local = local;
        this.volume = volume * volume;
        this.type = "video";

        socketAsset.assetList.push(this);
    }
}

// Image Class, Create Image Instances On assets.js
class socketImage extends socketAsset {

    // Class Constructor
    constructor (title, asset, duration=10, local=true) {
        super(title, asset, duration);
        this.local = local;
        this.type = "image";

        socketAsset.assetList.push(this);
    }
}

// Audio Class, Create Audio Instances On assets.js
class socketAudio extends socketAsset {

    // Class Constructor
    constructor (title, asset, duration=null, volume=1, local=true) {
        super(title, asset, duration);
        this.local = local;
        this.volume = volume * volume;
        this.type = "audio";

        socketAsset.assetList.push(this);
    }
}

// Voice Class, Create Voice Instances On assets.js
class socketVoice extends socketAsset {

    // Class Constructor
    constructor (title, asset, duration=null, volume=1, voice=null, userText=false) {
        super(title, asset, duration);
        this.volume = volume * volume;
        this.voice = voice == null ? 'en' : voice;
        this.userText = userText;
        this.type = "voice";

        socketAsset.assetList.push(this);
    }
}





// Twitch Video Player Web Socket Class
class webSocketVideoPlayer {

    // Class Contructor, Auth Code And Id Is Needed For The Channel
    constructor(authCode, channelId, pingIntervalTime=150000, retryIntervalTime=5000, assetOffset=750) {
        this.authCode = authCode;
        this.channelId = channelId;

        this.ws;
        this.pingStack = [];
        this.pingIntervalTime = pingIntervalTime;
        this.retryIntervalTime = retryIntervalTime;

        this.assetOffset = assetOffset;
        this.assetPlaying = false;
        this.assetQueue = [];
        this.currentAsset;
        this.interval;

        this.connectSocket();
    }


    // Socket Events
    connectSocket() {
        this.ws = new WebSocket("wss://pubsub-edge.twitch.tv");

        // On Connection Event
        this.ws.onopen = () => {
            console.log(`[VideoPlayer]: Web Socket Connected`);
            webSocketControl.sendLog({type: "VideoPlayer", content: "Web Socket Connected"});
            this.sendPing();
            this.interval = setInterval(() => {
                this.sendPing();
            }, this.pingIntervalTime);
            this.listen(`channel-points-channel-v1.${this.channelId}`);
        }

        // Message Received Event
        this.ws.onmessage = (event) => {
            let message = JSON.parse(event.data);

            if (message.error) {
                console.log(`[VideoPlayer]: Error Received, Restarting...`);
                webSocketControl.sendLog({type: "VideoPlayer", content: "Error Received, Restarting..."});
                clearInterval(this.interval);
                setTimeout(() => {
                    this.connectSocket();
                }, this.retryIntervalTime);
            }

            if (message.type === "RECONNECT") {
                console.log(`[VideoPlayer]: Reconnect Message Received, Restarting...`);
                webSocketControl.sendLog({type: "VideoPlayer", content: "Reconnect Message Received, Restarting..."});
                clearInterval(this.interval);
                setTimeout(() => {
                    this.connectSocket();
                }, this.retryIntervalTime);
            }
            else if (message.type === "PONG") {
                if (this.pingStack.length !== 1) {
                    console.log(`[VideoPlayer]: Ping System Doesn't Match, Restarting...`);
                    webSocketControl.sendLog({type: "VideoPlayer", content: "Ping System Doesn't Match, Restarting..."});
                    this.pingStack = [];
                    clearInterval(this.interval);
                    setTimeout(() => {
                        this.connectSocket();
                    }, this.retryIntervalTime);
                }
                else {
                    this.pingStack.pop();
                    console.log(`[VideoPlayer]: Pong Received`);
                    webSocketControl.sendLog({type: "VideoPlayer", content: "Pong Received"});
                }
            }
            else if (message.type === "MESSAGE") {
                let data = JSON.parse(message.data.message);
                console.log(`[VideoPlayer]: Received From Twitch: ${JSON.stringify(data)}`);
                webSocketControl.sendLog({type: "VideoPlayer", content: `Received From Twitch: ${JSON.stringify(data)}`});

                for (let asset of socketAsset.assetList) {
                    if (data.data.redemption.reward.title === asset.title) {
                        if (asset.userText) {
                            asset.asset = data.data.redemption.reward.prompt;
                        }
                        console.log(`[VideoPlayer]: Playing ${asset.asset}...`);
                        webSocketControl.sendLog({type: "VideoPlayer", content: `Playing ${asset.asset}...`});
                        this.assetQueue.push(asset);
                        if (this.assetQueue.length === 1 && this.assetQueue[0] === asset && !this.assetPlaying) {
                            this.manageAssets();
                        }
                    }
                }
            }
            else if (message.type === "RESPONSE") {
                console.log(`[VideoPlayer]: Listening To Topics Went Fine`);
                webSocketControl.sendLog({type: "VideoPlayer", content: "Listening To Topics Went Fine"});
            }
            else {
                console.log(`[VideoPlayer]: Received From Twitch (No Identified): ${JSON.stringify(message)}`);
                webSocketControl.sendLog({type: "VideoPlayer", content: `Received From Twitch (No Identified): ${JSON.stringify(message)}`});
            }
        }

        // Socket Disconnected Event
        this.ws.onclose = () => {
            console.log(`[VideoPlayer]: Web Socket Disconnected, Retrying...`);
            webSocketControl.sendLog({type: "VideoPlayer", content: "Web Socket Disconnected, Retrying..."});
            clearInterval(this.interval);
            setTimeout(() => {
                this.connectSocket();
            }, this.retryIntervalTime);
        }

        // Socket Error Event
        this.ws.onerror = () => {
            console.log(`[VideoPlayer]: Web Socket Error, Retrying...`);
            webSocketControl.sendLog({type: "VideoPlayer", content: "Web Socket Error, Retrying..."});
            clearInterval(this.interval);
            setTimeout(() => {
                this.connectSocket();
            }, this.retryIntervalTime);
        }
    }


    // Random Code Generator
    nonce(length) {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }


    // Socket Ping Sender
    sendPing() {
        if (this.pingStack.length !== 0) {
            console.log(`[VideoPlayer]: Ping System Doesn't Match, Restarting...`);
            webSocketControl.sendLog({type: "VideoPlayer", content: "Ping System Doesn't Match, Restarting..."});
            this.pingStack = [];
            clearInterval(this.interval);
            setTimeout(() => {
                this.connectSocket();
            }, this.retryIntervalTime);
        }
        else {
            this.ws.send(JSON.stringify({
                type: "PING"
            }));
            this.pingStack.push("PING");
            console.log("[VideoPlayer]: Ping Sent");
            webSocketControl.sendLog({type: "VideoPlayer", content: "Ping Sent"});
        }
    }


    // Socket Listen To Topics
    listen(topic) {
        let message = {
            type: 'LISTEN',
            nonce: this.nonce(15),
            data: {
                topics: [topic],
                auth_token: this.authCode
            }
        };
        this.ws.send(JSON.stringify(message));
    }



    // Removes All Elements From DOM
    restartDOM() {
        console.log("[VideoPlayer]: Restarting DOM");
        webSocketControl.sendLog({type: "VideoPlayer", content: "Restarting DOM"});
        socketVoice.synth.cancel();
        if (document.body.childNodes.length > 5) {
            for (let i = 5; i < document.body.childNodes.length; ++i) {
                document.body.childNodes[i].remove();
            }
        }
        this.assetPlaying = false;
        this.manageAssets();
    }


    // Removes All Elements From DOM
    restartQueue() {
        console.log("[VideoPlayer]: Restarting Queue");
        webSocketControl.sendLog({type: "VideoPlayer", content: "Restarting Queue"});
        this.assetQueue = [];
        this.assetPlaying = false;
    }



    // Manage Videos And Gifs To Be Played
    manageAssets() {
        setTimeout(() => {
            if (this.assetQueue.length === 0) {
                console.log("[VideoPlayer]: Can't Play, Asset Queue Empty");
                webSocketControl.sendLog({type: "VideoPlayer", content: "Can't Play, Asset Queue Empty"});
                return;
            }
            else if (!this.assetPlaying && this.assetQueue.length === 0) {
                this.currentAsset = this.assetQueue.shift();
            }
            else {
                if (!this.assetPlaying) {
                    this.currentAsset = this.assetQueue.shift();
                }
                else {
                    return;
                }
            }
            this.assetPlaying = true;
            if (this.currentAsset instanceof socketVideo || this.currentAsset.type === "video") {
                this.playVideo(this.currentAsset);
            }
            else if (this.currentAsset instanceof socketImage || this.currentAsset.type === "image") {
                this.playImage(this.currentAsset);
            }
            else if (this.currentAsset instanceof socketAudio || this.currentAsset.type === "audio") {
                this.playAudio(this.currentAsset);
            }
            else if (this.currentAsset instanceof socketVoice || this.currentAsset.type === "voice") {
                this.playVoice(this.currentAsset);
            }
            else {
                console.log(`[VideoPlayer]: Can't Play Unsupported File Types`);
                webSocketControl.sendLog({type: "VideoPlayer", content: "Can't Play Unsupported File Types"});
                this.assetPlaying = false;
                return;
            }
        }, this.assetOffset);
    }


    // Play The Video And Remove It After It Ends
    playVideo(asset) {
        let videoTag = document.createElement("video");
        let sourceTag = document.createElement("source");
        videoTag.load();
        videoTag.autoplay = true;
        videoTag.volume = asset.volume;
        sourceTag.src = (asset.local) ? `assets/${asset.asset}` : asset.asset;
        let type = asset.asset.split(".");
        sourceTag.type = `video/${type[type.length-1]}`;
        videoTag.appendChild(sourceTag);

        let videoInterval = setInterval(() => {
            if (videoTag.readyState === 4) {
                document.body.appendChild(videoTag);
                videoTag.play();
                clearInterval(videoInterval);
            }
        });

        videoTag.addEventListener('ended', () => {
            videoTag.remove();
            this.assetPlaying = false;
            if (this.assetQueue.length !== 0) {
                this.manageAssets();
            }
        });

        if(asset.duration !== null) {
            setTimeout(() => {
                if (document.getElementsByTagName('video').length !== 0) {
                    videoTag.remove();
                    this.assetPlaying = false;
                    if (this.assetQueue.length !== 0) {
                        this.manageAssets();
                    }
                }
            }, asset.duration * 1000);
        }
    }


    // Play The Image And Remove It After It's Duration
    playImage(asset) {
        let imageTag = document.createElement("img");
        imageTag.src = (asset.local) ? `assets/${asset.asset}` : asset.asset;
        document.body.appendChild(imageTag);
        setTimeout(() => {
            imageTag.remove();
            this.assetPlaying = false;
            if (this.assetQueue.length !== 0) {
                this.manageAssets();
            }
        }, (asset.duration) ? asset.duration * 1000 : 10 * 1000);
    }


    // Play The Audio And Remove It After It's Duration
    playAudio(asset) {
        let audioTag = document.createElement("audio");
        let sourceTag = document.createElement("source");
        audioTag.load();
        audioTag.autoplay = true;
        audioTag.volume = asset.volume;
        sourceTag.src = (asset.local) ? `assets/${audio.asset}` : asset.asset;
        sourceTag.type = "audio/mpeg";
        audioTag.appendChild(sourceTag);

        let audioInterval = setInterval(() => {
            if (audioTag.readyState === 4) {
                document.body.appendChild(audioTag);
                audioTag.play();
                clearInterval(audioInterval);
            }
        });

        audioTag.addEventListener('ended', () => {
            audioTag.remove();
            this.assetPlaying = false;
            if (this.assetQueue.length !== 0) {
                this.manageAssets();
            }
        });

        if(asset.duration !== null) {
            setTimeout(() => {
                if (document.getElementsByTagName('audio').length !== 0) {
                    audioTag.remove();
                    this.assetPlaying = false;
                    if (this.assetQueue.length !== 0) {
                        this.manageAssets();
                    }
                }
            }, asset.duration * 1000);
        }
    }


    // Play The Voice And Remove It After It's Duration
    playVoice(asset) {
        let audioTag = document.createElement("audio");
        let sourceTag = document.createElement("source");
        audioTag.load();
        audioTag.autoplay = true;
        audioTag.volume = asset.volume;
        let url = `https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&client=tw-ob&prev=input&tl=${asset.voice}&q=${encodeURIComponent(asset.asset)}`;
        sourceTag.src = url;
        sourceTag.type = "audio/mpeg";
        audioTag.appendChild(sourceTag);

        let audioInterval = setInterval(() => {
            if (audioTag.readyState === 4) {
                document.body.appendChild(audioTag);
                audioTag.play();
                clearInterval(audioInterval);
            }
        });

        audioTag.addEventListener('ended', () => {
            audioTag.remove();
            this.assetPlaying = false;
            if (this.assetQueue.length !== 0) {
                this.manageAssets();
            }
        });

        if(asset.duration !== null) {
            setTimeout(() => {
                if (document.getElementsByTagName('audio').length !== 0) {
                    audioTag.remove();
                    this.assetPlaying = false;
                    if (this.assetQueue.length !== 0) {
                        this.manageAssets();
                    }
                }
            }, asset.duration * 1000);
        }
    }


    // Play The Voice And Remove It After It's Duration
    playVoice2(asset) {
        let message = new SpeechSynthesisUtterance(asset.asset);
        message.voice = (asset.voice) ? socketVoice.voices[asset.voice] : socketVoice.defaultVoice;
        message.volume = asset.volume;
        message.pitch = asset.pitch;
        message.rate = asset.rate;
        socketVoice.synth.speak(message);
        message.onend = () => {
            this.assetPlaying = false;
            if (this.assetQueue.length !== 0) {
                this.manageAssets();
            }
        }

        if(asset.duration !== null) {
            setTimeout(() => {
                socketVoice.synth.cancel();
                this.assetPlaying = false;
                if (this.assetQueue.length !== 0) {
                    this.manageAssets();
                }
            }, asset.duration * 1000);
        }
    }
}





// Remote Control Web Socket
class webSocketControl {

    // Keeps Track Of Whether The Control Socket Is Connected Or Not
    static socketConnected = false;
    static socketInstance;

    static sendLog(message) {
        if (webSocketControl.socketConnected) {
            webSocketControl.socketInstance.ws.send(JSON.stringify({
                type: message.type,
                content: message.content
            }));
        }
    }

    // Class Constructor, Ip Adress And Port Needed
    constructor(client, version, adress, port, retryIntervalTime=120000) {
        this.client = client;
        this.version = version;
        this.adress = adress;
        this.port = port;
        this.currentAdress = 0;

        this.ws;
        this.retryIntervalTime = retryIntervalTime;

        webSocketControl.socketInstance = this;
        this.connectSocket();
    }


    // Socket Events
    async connectSocket() {
        if (this.currentAdress >= this.adress.length) this.currentAdress = 0;

        this.ws = await new WebSocket(`ws://${this.adress[this.currentAdress]}:${this.port}`);

        // On Connection Event
        this.ws.onopen = () => {
            webSocketControl.socketConnected = true;
            console.log(`[SocketControl]: Web Socket Connected`);
            this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "Identifier", client: this.client, version: this.version}}));
        }

        // Message Received Event
        this.ws.onmessage = (event) => {
            let message = JSON.parse(event.data);
            if (message.type === "PING") {
                console.log(`[SocketControl]: Ping Received`);
                this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "PONG"}}));
                console.log(`[SocketControl]: Pong Sent`);
            }
            else if (message.type === "PlayVideo") {
                if (message.asset.asset === undefined || message.asset.type === undefined) {
                    this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "PlayVideo", message: "error"}}));
                }
                else {
                    console.log(`[SocketControl]: ${message.asset.type[0].toUpperCase()}${message.asset.type.slice(1)} Request Received, Playing: ${message.asset.asset}`);
                    let asset = {
                        asset: message.asset.asset,
                        duration: message.asset.duration,
                        local: message.asset.local,
                        type: message.asset.type
                    };
                    if (message.asset.type === "video" || message.asset.type === "audio") {
                        asset.volume = message.asset.volume;
                    }
                    else if (message.asset.type === "voice") {
                        asset.volume = message.asset.volume;
                        asset.voice = message.asset.voice;
                    }
                    videoPlayer.assetQueue.push(asset);
                    videoPlayer.manageAssets();
                    this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "PlayVideo", message: "success"}}));
                }
            }
            else if (message.type === "Restart") {
                if (message.order === 0) {
                    console.log(`[SocketControl]: Restarting DOM`);
                    videoPlayer.restartDOM();
                    this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "Restart", message: "DOM restarted"}}));
                }
                else if (message.order === 1) {
                    console.log(`[SocketControl]: Restarting Queue`);
                    videoPlayer.restartQueue();
                    this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "Restart", message: "queue restarted"}}));
                }
                else if (message.order === 2) {
                    console.log(`[SocketControl]: Restarting DOM And Queue`);
                    videoPlayer.restartDOM();
                    videoPlayer.restartQueue();
                    this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "Restart", message: "DOM and queue restarted"}}));
                }
            }
            else if (message.type === "GetAssets") {
                console.log(`[SocketControl]: Sending Assets`);
                let assets = {
                    video: socketAsset.assetList.filter(asset => asset.type === "video"),
                    image: socketAsset.assetList.filter(asset => asset.type === "image"),
                    audio: socketAsset.assetList.filter(asset => asset.type === "audio"),
                    voice: socketAsset.assetList.filter(asset => asset.type === "voice")
                }
                this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "GetAssets", assets}}));
            }
            else {
                console.log(`[SocketControl]: Received Unknown:`, message);
                this.ws.send(JSON.stringify({type: "SocketControl", content: {type: "Error", message: "unrecognized message"}}));
            }
        }

        // Socket Disconnected Event
        this.ws.onclose = () => {
            webSocketControl.socketConnected = false;
            console.log(`[SocketControl]: Web Socket Disconnected, Retrying...`);
            setTimeout(() => {
                this.currentAdress++;
                this.connectSocket();
            }, this.retryIntervalTime);
        }

        // Socket Error Event
        this.ws.onerror = () => {
            console.log(`[SocketControl]: Web Socket Error`);
        }
    }
}





// Video Player And Control Socket
const bodyLoaded = () => {
    socketVoice.synth = window.speechSynthesis;
    setTimeout(() => {
        videoPlayer = new webSocketVideoPlayer(authCode=authCode, channelId=channelId, pingIntervalTime=150000, retryIntervalTime=5000, assetOffset=assetOffset);
        // socketControl = new webSocketControl(client=twitchUsername, version="1.0.8", adress=["fusiveserver.ddns.net", "localhost", "192.168.0.10"], port="5567");
    }, 500);
};