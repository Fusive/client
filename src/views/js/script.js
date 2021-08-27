const { ipcRenderer } = require('electron');



const handleLoad = () => {
    getPath();
    getAssets();
}



var appPath = null;

const getPath = () => {
    ipcRenderer.send('path:get');
}

ipcRenderer.on('path:get', (e, path) => {
    appPath = path;
});



const getAssets = () => {
    ipcRenderer.send('asset:get');
}

const addAsset = (asset) => {
    if (asset['assetPath']) {
        asset['assetPath'] = asset['assetPath'].replaceAll('\\', '/');
    }
    let preview;
    if (asset['type'] === "Video") {
        preview = `
            <video src="${appPath}/data/assets/${asset['id']}.${asset['assetName'].substr(asset['assetName'].length-3,3)}#t=0.5" preload="metadata"></video>
        `;
    }
    else if (asset['type'] === "Image/Gif") {
        preview = `
            <img src="${appPath}/data/assets/${asset['id']}.${asset['assetName'].substr(asset['assetName'].length-3,3)}"></img>
        `;
    }
    else if (asset['type'] === "Audio") {
        preview = `
            <svg height="512pt" viewBox="0 -30 700 700" width="512pt"><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="256" x2="256" y1="0" y2="452"><stop offset="0" stop-color="#2af598"/><stop offset="1" stop-color="#009efd"/></linearGradient><path d="m 94,254 h 40 V 386 H 94 Z m 79,212 h 40 V 174 h -40 z m 78,80 h 40 V 94 h -40 z m 78,-160 h 40 V 254 h -40 z m 79,110 h 40 V 144 H 408 Z M 566,254 v 142 h 40 V 254 Z m -79,292 h 40 V 94 h -40 z m 0,0" fill="url(#a)"/></svg>
        `;
    }
    else if (asset['type'] === "Voice") {
        preview = `
            <p>${asset['text']}</p>
        `;
    }

    document.getElementById("assets-list").innerHTML += `
    <div class="asset-container" id="asset-${asset['id']}" title="id: ${asset['id']}${(asset['assetName'] === undefined) ? '' : `\nfile: ${asset['assetName']}`}">
        <div class="asset-preview">
            ${preview}
        </div>
        <div class="asset-type asset-text-data">
            <p>Type: ${asset['type']}</p>
        </div>
        ${(asset['title'] === "") ? "" : `
            <div class="asset-title asset-text-data">
                <p>Title: ${asset['title']}</p>
            </div>
        `}
        ${(asset['volume'] === undefined) ? "" : `
            <div class="asset-volume asset-text-data">
                <p>Volume: ${asset['volume'].toString()}%</p>
            </div>
        `}
        ${(asset['duration'] === undefined || asset['duration'] === null) ? "" : `
            <div class="asset-duration asset-text-data">
                <p>Duration: ${asset['duration'].toString()}s</p>
            </div>
        `}
        ${(asset['voice'] === undefined) ? "" : `
            <div class="asset-voice asset-text-data">
                <p>Voice: ${asset['voice']}</p>
            </div>
        `}
        ${(asset['userText'] === undefined) ? "" : `
            <div class="asset-user-text asset-text-data">
                <p>User Text: ${(asset['userText'] === true) ? "True" : "False"}</p>
            </div>
        `}
        <div class="asset-options">
            <button class="asset-edit">Edit</button>
            <button class="asset-delete" onclick="deleteAsset('${asset['id']}')">Delete</button>
        </div>
    </div>
    `;

    if (document.getElementsByClassName('asset-container').length > 0) {
        document.getElementById("no-assets").style.display = "none";
    }
    else {
        document.getElementById("no-assets").style.display = "block";
    }
}

const deleteAsset = (id) => {
    ipcRenderer.send('asset:delete', id);
}



ipcRenderer.on('asset:get', (e, assets) => {
    for (let i = 0; i < assets.length; ++i) {
        addAsset(assets[i]);
    }
});

ipcRenderer.on('asset:new', (e, newAsset) => {
    addAsset(newAsset);
});

ipcRenderer.on('asset:delete', (e, id, response) => {
    console.log(id);
    if (response) {
        document.getElementById(`asset-${id}`).style.opacity = 0;
        setTimeout(() => {
            document.getElementById(`asset-${id}`).remove();
            if (document.getElementsByClassName('asset-container').length > 0) {
                document.getElementById("no-assets").style.display = "none";
            }
            else {
                document.getElementById("no-assets").style.display = "block";
            }
        }, 250);
    }
});