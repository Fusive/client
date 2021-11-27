const { ipcRenderer } = require('electron');



const handleLoad = () => {
    getPath();
    getAuth();
    getAssets();
}



var appPath = null;

const getPath = () => {
    ipcRenderer.send('path:get');
}

ipcRenderer.on('path:get', (e, path) => {
    appPath = path;
});



const getAuth = () => {
    ipcRenderer.send('auth:get');
};

ipcRenderer.on('auth:get', (e, data) => {
    if (!data.valid) {
        document.getElementById("auth-missing").style.opacity = 1;
        document.getElementById("auth-missing").style.top = "50%";
    }
    else if (data.valid) {
        document.getElementById("auth-missing").style.opacity = 0;
        document.getElementById("auth-missing").style.top = "55%";
    };
});

ipcRenderer.on('auth:remove', (e) => getAuth());

ipcRenderer.on('auth:set', (e) => getAuth());

document.getElementById("auth-button").addEventListener('click', () => {
    ipcRenderer.send('auth:menu');
});



const getAssets = () => {
    ipcRenderer.send('asset:get');
}

const addAsset = (asset) => {
    let preview;
    if (asset['type'] === "Video") {
        preview = `
            <video autoplay loop muted></video>
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
    else if (asset['type'] === "Voice" || asset['type'] === "Text") {
        preview = `
            <p ${asset['color'] === undefined ? "" : `style="color:${asset['color']};"`}>${asset['text'] !== null ? asset['text'] : "* User Text Enabled *"}</p>
        `;
    }
    else if (asset['type'] === "Youtube") {
        preview = `
            <iframe src="https://www.youtube.com/embed/${asset['url']}?autoplay=1&mute=1&enablejsapi=1&loop=1&contols=0&rel=0&modestbranding=1" frameborder="0"></iframe>
        `;
    }

    const getBackgroundColor = (color) => {
        let r = parseInt(color.slice(1, 3), 16);
        let g = parseInt(color.slice(3, 5), 16);
        let b = parseInt(color.slice(5, 7), 16);
        if (r*0.299 + g*0.587 + b*0.114 > 69) return "#000000";
        else return "#ffffff";
    };

    document.getElementById("assets-list").innerHTML += `
    <div class="asset-container" id="asset-${asset['id']}" title="id: ${asset['id']}${(asset['assetName'] === undefined) ? '' : `\nfile: ${asset['assetName']}`}">
        <div class="asset-preview" ${asset['color'] === undefined ? "" : `style="background-color:${getBackgroundColor(asset['color'])};"`}>
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
        ${(asset['start'] === undefined) ? "" : `
            <div class="asset-start asset-text-data">
                <p>Start: ${asset['start'].toString()}s</p>
            </div>
        `}
        ${(asset['end'] === undefined) ? "" : `
            <div class="asset-end asset-text-data">
                <p>End: ${asset['end'].toString()}s</p>
            </div>
        `}
        ${(asset['size'] === undefined) ? "" : `
            <div class="asset-size asset-text-data">
                <p>Size: ${asset['size'].toString()}px</p>
            </div>
        `}
        ${(asset['color'] === undefined) ? "" : `
            <div class="asset-color asset-text-data">
                <p>Color: ${asset['color']}</p>
            </div>
        `}
        ${(asset['userText'] === undefined) ? "" : `
            <div class="asset-user-text asset-text-data">
                <p>User Text: ${(asset['userText'] === true) ? "True" : "False"}</p>
            </div>
        `}
        <div class="asset-options">
            <button class="asset-edit" onclick="editCurrentAsset('${asset['id']}')">Edit</button>
            <button class="asset-delete" onclick="deleteCurrentAsset('${asset['id']}')">Delete</button>
        </div>
    </div>
    `;

    if (asset['type'] === "Video") {
        let file = `${appPath}/data/assets/${asset['id']}.${asset['assetName'].substr(asset['assetName'].length-3,3)}`;
        fetch(file).then(res => res.blob()).then(blob => {
            const fileReader = new FileReader();
            fileReader.onload = e => {
                document.getElementById(`asset-${asset['id']}`).childNodes[1].childNodes[1].setAttribute('src', e.target.result);
            };
            fileReader.readAsDataURL(blob);
        });
    }

    if (document.getElementsByClassName('asset-container').length > 0) {
        document.getElementById("no-assets").style.display = "none";
    }
    else {
        document.getElementById("no-assets").style.display = "block";
    }
}



const editCurrentAsset = (id) => {
    ipcRenderer.send('asset:edit-req', id);
}

const deleteCurrentAsset = (id) => {
    ipcRenderer.send('asset:delete', id);
}



ipcRenderer.on('asset:get', (e, assets) => {
    for (let i = 0; i < assets.length; ++i) {
        addAsset(assets[i]);
    }
});

ipcRenderer.on('asset:new', (e, newAsset) => {
    location.reload();
});

ipcRenderer.on('asset:edit', (e, editedAsset, response) => {
    if (response) {
        location.reload();
    }
});

ipcRenderer.on('asset:delete', (e, id, response) => {
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