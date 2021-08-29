const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const gFuncs = require('./functions/general');
const dFuncs = require('./functions/database');
const eFuncs = require('./functions/export');

if (process.env.NODE !== undefined) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, "../node_modules/.bin/electron"),
    });
}





var mainWindow;
var newAssetWindow = null;
var editAssetWindow = null;

var database = "./data/data.json";
var outFolder = "./out";

app.on('ready', () => {
    createDatabaseFolders();
    createExportFolders();
    createExportFiles();

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
    if (newAssetWindow !== null) {
        newAssetWindow.destroy();
        newAssetWindow = null;
    }

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



const addEditAssetWindow = (asset) => {
    if (editAssetWindow !== null) {
        editAssetWindow.destroy();
        editAssetWindow = null;
    }

    editAssetWindow = new BrowserWindow({
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
    editAssetWindow.loadFile(path.join(__dirname, "views/html/edit-asset.html"));

    // const mainMenu = Menu.buildFromTemplate(templateMainMenu);
    // editAssetWindow.setMenu(mainMenu);
    editAssetWindow.setMenu(null);

    editAssetWindow.on('ready-to-show', () => {
        editAssetWindow.webContents.send('asset:edit', asset);
    });

    editAssetWindow.on('closed', () => {
        editAssetWindow = null;
    });
}





const createDatabaseFolders = async () => {
    await dFuncs.createDatabaseFolders();
}

const createExportFolders = async () => {
    await eFuncs.createExportFolders();
}

const createExportFiles = async () => {
    await eFuncs.createIndexFile(outFolder);
    await eFuncs.createStyleFile(outFolder);
    let assets = await dFuncs.getAssets(database);
    await eFuncs.createAssetsFile(outFolder, assets);
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

    await dFuncs.addAsset(database, newAsset);
    delete newAsset['assetContent'];
    await mainWindow.webContents.send('asset:new', newAsset);

    createExportFiles();

    e.sender.destroy();
});

ipcMain.on('asset:edit-req', async (e, id) => {
    let asset = await dFuncs.getAssets(database, id);
    addEditAssetWindow(asset);
});

ipcMain.on('asset:edit-save', async (e, asset) => {
    let response = await dFuncs.editAsset(database, asset);
    delete asset['assetContent'];
    delete asset['assetNamePrevious'];
    mainWindow.webContents.send('asset:edit', asset, response);

    createExportFiles();

    e.sender.destroy();
});

ipcMain.on('asset:delete', async (e, id) => {
    let response = await dFuncs.deleteAsset(database, id);

    createExportFiles();

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