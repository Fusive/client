const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const pjson = require('../package.json');

// General Functions
const gFuncs = require('./functions/general');
// Database Communication Functions
const dFuncs = require('./functions/database');
// Export Plugin Functions
const eFuncs = require('./functions/export');

if (process.env.NODE !== undefined) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, "../node_modules/.bin/electron"),
    });
}





// All Window Declarations
var mainWindow;
var newAssetWindow = null;
var editAssetWindow = null;
var authWindow = null;
var helpWindow = null;

// JSON Database And Export Paths
var database = "./data/data.json";
var outFolder = "./out";

// App Setup And Main Window Creation
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



// Window In Charge Of Creating The Data Of A Single Asset
const addNewAssetWindow = () => {
    if (newAssetWindow !== null) {
        newAssetWindow.destroy();
        newAssetWindow = null;
    }

    newAssetWindow = new BrowserWindow({
        width: 850,
        height: 750,
        resizable: false,
        webPreferences: {
            devTools: process.env.NODE !== undefined ? true : false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    newAssetWindow.loadFile(path.join(__dirname, "views/html/sec_asset/new-asset.html"));

    // const mainMenu = Menu.buildFromTemplate(templateMainMenu);
    // newAssetWindow.setMenu(mainMenu);
    newAssetWindow.setMenu(null);

    newAssetWindow.on('closed', () => {
        newAssetWindow = null;
    });
}



// Window In Charge Of Editing The Data Of A Single Asset
const addEditAssetWindow = (asset) => {
    if (editAssetWindow !== null) {
        editAssetWindow.destroy();
        editAssetWindow = null;
    }

    editAssetWindow = new BrowserWindow({
        width: 850,
        height: 750,
        resizable: false,
        webPreferences: {
            devTools: process.env.NODE !== undefined ? true : false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    editAssetWindow.loadFile(path.join(__dirname, "views/html/sec_asset/edit-asset.html"));

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



// Window In Charge Of Handling The Twitch Authentication
const addAuthWindow = () => {
    if (authWindow !== null) {
        authWindow.destroy();
        authWindow = null;
    }

    authWindow = new BrowserWindow({
        width: 400,
        height: 500,
        resizable: false,
        webPreferences: {
            devTools: process.env.NODE !== undefined ? true : false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    authWindow.loadFile(path.join(__dirname, "views/html/sec_auth/auth.html"));

    // const mainMenu = Menu.buildFromTemplate(templateMainMenu);
    // authWindow.setMenu(mainMenu);
    authWindow.setMenu(null);

    authWindow.on('closed', () => {
        authWindow = null;
    });
}



// Window In Charge Of Showing Different Help Sections
const addHelpWindow = (page) => {
    if (helpWindow !== null) {
        helpWindow.destroy();
        helpWindow = null;
    }

    helpWindow = new BrowserWindow({
        width: 800,
        height: 650,
        resizable: false,
        webPreferences: {
            devTools: process.env.NODE !== undefined ? true : false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    helpWindow.loadFile(path.join(__dirname, `views/html/sec_help/${page}.html`));

    // const mainMenu = Menu.buildFromTemplate(templateMainMenu);
    // helpWindow.setMenu(mainMenu);
    helpWindow.setMenu(null);

    helpWindow.on('closed', () => {
        helpWindow = null;
    });
}





// Database Functions And Window Cummunication Events
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

    let token = await dFuncs.getToken(database);
    let userCred = await dFuncs.getUserCred(database);
    var config = {
        'accessToken': token,
        'clientId': userCred["clientId"],
        'twitchUsername': userCred["twitchUsername"],
        'appVersion': pjson.version,
    };
    await eFuncs.createConfigFile(outFolder, config);
}



ipcMain.on('path:get', async (e) => {
    let appPath = __dirname;
    appPath = process.env.NODE !== undefined ? path.join(appPath, "../") : path.join(appPath, "../../../");
    e.sender.send('path:get', appPath);
});



ipcMain.on('auth:get', async (e) => {
    let token = await dFuncs.getToken(database);
    let data = await gFuncs.twitchValidateToken(token);
    if (data) {
        e.sender.send('auth:get', {token, valid: true});
        await dFuncs.addUserCred(database, data['user_id'], data['login']);
    }
    else e.sender.send('auth:get', {token, valid: false});

    await createExportFiles();
});

ipcMain.on('auth:set', async (e, data) => {
    await dFuncs.addToken(database, data.token);
    e.sender.destroy();

    await createExportFiles();

    await mainWindow.webContents.send('auth:set');
});

const removeToken = async (e) => {
    await dFuncs.removeToken(database);
    await dFuncs.removeUserCred(database);

    await createExportFiles();

    await mainWindow.webContents.send('auth:remove');
};
ipcMain.on('auth:remove', removeToken);

ipcMain.on('auth:menu', async (e) => {
    addAuthWindow();
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

    await createExportFiles();

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

    await createExportFiles();

    e.sender.destroy();
});

ipcMain.on('asset:delete', async (e, id) => {
    let response = await dFuncs.deleteAsset(database, id);

    await createExportFiles();

    e.sender.send('asset:delete', id, response);
});



ipcMain.on('version:get', async (e) => {
    e.sender.send('version:get', pjson.version);
});





// Menu Templates
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
        label: 'Auth',
        submenu: [
            {
                label: 'Authenticate With Twitch',
                click() {
                    addAuthWindow();
                },
            },
            {
                label: 'Remove Twitch Connection',
                click() {
                    removeToken();
                },
            },
        ],
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Tutorial',
                click() {
                    addHelpWindow('tutorial');
                },
            },
            {
                label: 'Info',
                click() {
                    addHelpWindow('info');
                },
            },
            {
                label: 'Report A Bug',
                click() {
                    addHelpWindow('report_a_bug');
                },
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