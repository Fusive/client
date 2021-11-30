const fs = require('fs');
const path = require('path');

// General Functions
const gFuncs = require('./general');

const dFuncs = {
    // Create The Folders In Charge Of Handling The Data
    async createDatabaseFolders() {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data');
            fs.mkdirSync('./data/assets');
        }
        else if (!fs.existsSync('./data/assets')) {
            fs.mkdirSync('./data/assets');
        }
    },

    // Create The Main Database File
    async createDatabase(database) {
        fs.writeFileSync(database, "{}");
    },

    // Get All Data From The Database
    async readFromDatabase(database) {
        let rawData;
        let data;
        try {
            rawData = fs.readFileSync(database);
            data = await JSON.parse(rawData);
            return data;
        }
        catch (error) {
            await this.createDatabase(database);
            return {};
        }
    },

    // Writes Data To The Database File
    async writeDataToDatabase(database, data) {
        if (typeof(data) !== "string") {
            data = JSON.stringify(data);
        }
        fs.writeFileSync(database, data);
    },

    // Creates A Asset File
    async createFile(database, assetId, assetName, assetContent) {
        let fileName = `${assetId}.${assetName.substr(assetName.length-3,3)}`;
        let filePath = path.join(database, "../", `./assets/${fileName}`);
        fs.writeFileSync(filePath, new Buffer.from(assetContent));
    },

    // Deletes A Asset File
    async deleteFile(database, assetId, assetName) {
        let fileName = `${assetId}.${assetName.substr(assetName.length-3,3)}`;
        let filePath = path.join(database, "../", `./assets/${fileName}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    },



    // Creates A Unique ID For An Asset
    async createId(database) {
        let id = "";
        let data = await this.readFromDatabase(database);
        while (true) {
            for (let i = 0; i < 16; ++i) {
                id += `${gFuncs.randomInRange(0, 10)}`;
            }
            if (data['assets'] === undefined) {
                break;
            }
            else {
                for (let i = 0; i < data['assets']; ++i) {
                    if (id === data['assets'][i]['id']) {
                        continue;
                    }
                }
                break;
            }
        }
        return id;
    },

    // Gets A List Of All The Assets
    async getAssets(database, id=null) {
        let data = await this.readFromDatabase(database);
        if (data['assets'] === undefined) {
            data['assets'] = [];
            await this.writeDataToDatabase(database, data);
        }
        if (id === null) {
            return data['assets'];
        }
        else {
            for (let i = 0; i < data['assets'].length; ++i) {
                if (data['assets'][i]['id'] === id) {
                    return data['assets'][i];
                }
            }
        }
    },

    // Adds An Asset To The Files Folder And The Database File
    async addAsset(database, asset) {
        let data = await this.readFromDatabase(database);
        if (data['assets'] === undefined) {
            data['assets'] = [];
        }

        if (asset['assetName']) {
            await this.createFile(database, asset['id'], asset['assetName'], asset['assetContent']);
            delete asset['assetContent'];
        }

        data['assets'].push(asset);
        await this.writeDataToDatabase(database, data);
    },

    // Edits A Asset Data In The Files Folder And In The Database File
    async editAsset(database, asset) {
        let data = await this.readFromDatabase(database);

        let deleted = false;
        let newDataAssets = [];
        for (let i = 0; i < data['assets'].length; ++i) {
            if (data['assets'][i]['id'] === asset['id']) {
                if (asset['assetName']) {
                    await this.deleteFile(database, asset['id'], asset['assetNamePrevious']);
                    await this.createFile(database, asset['id'], asset['assetName'], asset['assetContent']);
                }
                else if (asset['assetName'] === null) {
                    asset['assetName'] = asset['assetNamePrevious'];
                }
                delete asset['assetNamePrevious'];
                delete asset['assetContent'];
                newDataAssets.push(asset);
                deleted = true;
            }
            else {
                newDataAssets.push(data['assets'][i]);
            }
        }

        data['assets'] = newDataAssets;
        await this.writeDataToDatabase(database, data);
        return deleted;
    },

    // Deletes A Asset Selecting It By Its ID
    async deleteAsset(database, id) {
        let data = await this.readFromDatabase(database);
        if (data['assets'] !== undefined) {
            for (let i = 0; i < data['assets'].length; ++i) {
                if (data['assets'][i]['id'] == id) {
                    if (data['assets'][i]['assetName']) {
                        await this.deleteFile(database, data['assets'][i]['id'], data['assets'][i]['assetName']);
                    }

                    data['assets'].splice(i, 1);
                    await this.writeDataToDatabase(database, data);
                    return true;
                }
            }
        }
        return false;
    },



    // Gets The Actual Auth Token Saved In The Database File
    async getToken(database) {
        let data = await this.readFromDatabase(database);
        if (data['token'] === undefined) {
            data['token'] = "";
            await this.writeDataToDatabase(database, data);
        }
        else return data['token'];
    },

    // Adds Or Replaces The Auth Token In The Database File
    async addToken(database, token) {
        let data = await this.readFromDatabase(database);
        if (data['token'] === undefined) {
            data['token'] = "";
        }

        data['token'] = token;
        await this.writeDataToDatabase(database, data);
    },

    // Removes The Auth Token In The Database File
    async removeToken(database) {
        let data = await this.readFromDatabase(database);
        data['token'] = "";
        await this.writeDataToDatabase(database, data);
    },



    // Gets The User Information Stored In The Database File
    async getUserCred(database) {
        let data = await this.readFromDatabase(database);
        if (data['clientId'] === undefined) data['clientId'] = "";
        if (data['twitchUsername'] === undefined) data['twitchUsername'] = "";
        if (data['scopes'] === undefined) data['scopes'] = [];
        await this.writeDataToDatabase(database, data);
        return {"clientId": data["clientId"], "twitchUsername": data["twitchUsername"], "scopes": data["scopes"]};
    },

    // Adds User Information To The Database File
    async addUserCred(database, clientId, twitchUsername, scopes) {
        let data = await this.readFromDatabase(database);
        if (data['clientId'] === undefined) data['clientId'] = "";
        if (data['twitchUsername'] === undefined) data['twitchUsername'] = "";
        if (data['scopes'] === undefined) data['scopes'] = [];

        data['clientId'] = clientId;
        data['twitchUsername'] = twitchUsername;
        data['scopes'] = scopes;
        await this.writeDataToDatabase(database, data);
    },

    // Removes The User Information In The Database File
    async removeUserCred(database) {
        let data = await this.readFromDatabase(database);
        data['clientId'] = "";
        data['twitchUsername'] = "";
        data['scopes'] = [];
        await this.writeDataToDatabase(database, data);
    },
}

module.exports = dFuncs;