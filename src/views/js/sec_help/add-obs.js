const { ipcRenderer, clipboard } = require('electron');



const handleLoad = () => {
    ipcRenderer.send('path:get');
}



ipcRenderer.on('path:get', (e, path) => {
    path = `file://${path.replaceAll("\\", "/")}out/index.html`;
    document.getElementById("file-url").innerText = path;
});



var currentCopyTimeout = undefined;
let copyButton = document.getElementById("file-button");
copyButton.addEventListener('click', () => {
    if (currentCopyTimeout) {
        clearTimeout(currentCopyTimeout);
    }
    clipboard.writeText(document.getElementById("file-url").innerText);
    copyButton.innerText = "COPIED!";
    currentCopyTimeout = setTimeout(() => {
        copyButton.innerText = "COPY";
        currentCopyTimeout = undefined;
    }, 3000);
});