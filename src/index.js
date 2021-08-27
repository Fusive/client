const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const gFuncs = require('./functions/general');
const dFuncs = require('./functions/database');

if (process.env.NODE !== undefined) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, "../node_modules/.bin/electron"),
    });
}



var mainWindow;
var newAssetWindow;

var database = "./data/data.json";

app.on('ready', () => {
    createDatabaseFolders();

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 680,
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



const createDatabaseFolders = () => {
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
        fs.mkdirSync('./data/assets');
    }
    else if (!fs.existsSync('./data/assets')) {
        fs.mkdirSync('./data/assets');
    }
}



ipcMain.on('path:get', async (e) => {
    let appPath = __dirname;
    appPath = process.env.NODE !== undefined ? path.join(appPath, "../") : path.join(appPath, "../../../");
    e.sender.send('path:get', appPath);
});

ipcMain.on('asset:get', async (e) => {
    let assets = await dFuncs.getAssets(database);
    e.sender.send('asset:get', assets);
});

ipcMain.on('asset:new', async (e, newAsset) => {
    newAsset['local'] = true;
    newAsset['id'] = await dFuncs.createId(database);

    if (newAsset['assetName']) {
        fs.writeFileSync(`./data/assets/${newAsset['id']}.${newAsset['assetName'].substr(newAsset['assetName'].length-3,3)}`, new Buffer.from(newAsset['assetContent']));
        delete newAsset['assetContent'];
    }

    await dFuncs.addAsset(database, newAsset);
    await mainWindow.webContents.send('asset:new', newAsset);

    e.sender.destroy();
});

ipcMain.on('asset:delete', async (e, id) => {
    let response = await dFuncs.deleteAsset(database, id);
    e.sender.send('asset:delete', id, response);
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