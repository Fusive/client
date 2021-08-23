const { ipcRenderer } = require('electron');

ipcRenderer.on('asset:new', (e, newAsset) => {
    if (newAsset['asset']) {
        newAsset['asset'] = newAsset['asset'].replaceAll('\\', '/');
    }
    let preview;
    if (newAsset['type'] === "Video") {
        preview = `
            <video src="${newAsset['asset']}"></video>
        `;
    }
    else if (newAsset['type'] === "Image/Gif") {
        preview = `
            <img src="${newAsset['asset']}"></img>
        `;
    }
    else if (newAsset['type'] === "Audio") {
        preview = `
            <svg height="512pt" viewBox="0 -30 700 700" width="512pt"><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="256" x2="256" y1="0" y2="452"><stop offset="0" stop-color="#2af598"/><stop offset="1" stop-color="#009efd"/></linearGradient><path d="m 94,254 h 40 V 386 H 94 Z m 79,212 h 40 V 174 h -40 z m 78,80 h 40 V 94 h -40 z m 78,-160 h 40 V 254 h -40 z m 79,110 h 40 V 144 H 408 Z M 566,254 v 142 h 40 V 254 Z m -79,292 h 40 V 94 h -40 z m 0,0" fill="url(#a)"/></svg>
        `;
    }
    else if (newAsset['type'] === "Voice") {
        preview = `
            <p>${newAsset['text']}</p>
        `;
    }

    document.getElementById("assets-list").innerHTML += `
    <div class="asset-container">
        <div class="asset-preview">
            ${preview}
        </div>
        <div class="asset-type asset-text-data">
            <p>Type: ${newAsset['type']}</p>
        </div>
        ${(newAsset['title'] === "") ? "" : `
            <div class="asset-title asset-text-data">
                <p>Title: ${newAsset['title']}</p>
            </div>
        `}
        ${(newAsset['volume'] === undefined) ? "" : `
            <div class="asset-volume asset-text-data">
                <p>Volume: ${newAsset['volume']}%</p>
            </div>
        `}
        ${(newAsset['duration'] === undefined || newAsset['duration'] === null) ? "" : `
            <div class="asset-duration asset-text-data">
                <p>Duration: ${newAsset['duration']}s</p>
            </div>
        `}
        ${(newAsset['voice'] === undefined) ? "" : `
            <div class="asset-voice asset-text-data">
                <p>Voice: ${newAsset['voice']}</p>
            </div>
        `}
        ${(newAsset['userText'] === undefined) ? "" : `
            <div class="asset-user-text asset-text-data">
                <p>User Text: ${(newAsset['userText'] === true) ? "True" : "False"}</p>
            </div>
        `}
        <div class="asset-options">
            <button class="asset-edit">Edit</button>
            <button class="asset-delete">Delete</button>
        </div>
    </div>
    `;

    if (document.getElementsByClassName('asset-container').length > 0) {
        document.getElementById("no-assets").style.display = "none";
    }
    else {
        document.getElementById("no-assets").style.display = "block";
    }
});