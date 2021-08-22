const { ipcRenderer } = require('electron');

ipcRenderer.on('asset:new', (e, newAsset) => {
    document.getElementById("assets-list").innerHTML += `
    <div class="asset-container">
        <div class="asset-preview">
            <img src="D:\\Google Drive\\Raw Material\\test.jpg"></img>
        </div>
        ${(newAsset['type'] === "") ? "" : `
            <div class="asset-type asset-text-data">
                <p>Type: ${newAsset['type']}</p>
            </div>
        `}
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