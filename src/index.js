const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

if (process.env.NODE !== undefined) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, "../node_modules/.bin/electron"),
    });
}



var mainWindow;
var newAssetWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            devTools: process.env.NODE !== undefined ? true : false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    mainWindow.loadFile(path.join(__dirname, "views/html/index.html"));

    const mainMenu = Menu.buildFromTemplate(templateMainMenu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', () => {
        app.quit();
    });
});



const addNewAssetWindow = () => {
    newAssetWindow = new BrowserWindow({
        width: 850,
        height: 600,
        resizable: false,
        webPreferences: {
            devTools: process.env.NODE !== undefined ? true : false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    newAssetWindow.loadFile(path.join(__dirname, "views/html/new-asset.html"));

    // const mainMenu = Menu.buildFromTemplate(templateMainMenu);
    // newAssetWindow.setMenu(mainMenu);
    newAssetWindow.setMenu(null);

    newAssetWindow.on('closed', () => {
        newAssetWindow = null;
    });
}



ipcMain.on('asset:new', (e, newAsset) => {
    mainWindow.webContents.send('asset:new', newAsset);
    e.sender.destroy();
});



const templateMainMenu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Asset',
                accelerator: process.platform === 'darwin' ? 'command+N' : 'Ctrl+N',
                click() {
                    addNewAssetWindow();
                },
            },
            {
                label: 'Exit',
                accelerator: process.platform === 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                },
            },
        ],
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Tutorial',
                click() {},
            },
            {
                label: 'Info',
                click() {},
            },
            {
                label: 'Report A Bug',
                click() {},
            },
        ],
    },
];

if (process.platform === 'darwin') {
    templateMainMenu.unshift({
        label: app.getName(),
    });
}

if (process.env.NODE !== undefined) {
    templateMainMenu.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide DevTools',
                accelerator: process.platform === 'darwin' ? 'command+Shift+I' : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                },
            },
            {
                role: 'reload'
            },
        ],
    });
}