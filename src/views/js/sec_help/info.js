const { ipcRenderer, shell } = require('electron');

const handleLoad = () => {
    ipcRenderer.send('version:get');
};

ipcRenderer.on('version:get', (e, version) => {
    let processedVersion = (version.startsWith("0.")) ? `Beta ${version}` : version;
    document.getElementById("version").innerText = processedVersion;
});

const linkClick = (link) => {
    shell.openExternal(link);
};