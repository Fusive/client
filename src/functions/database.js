const fs = require('fs');
const path = require('path');

const gFuncs = require('./general');

const dFuncs = {
    async createDatabaseFolders() {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data');
            fs.mkdirSync('./data/assets');
        }
        else if (!fs.existsSync('./data/assets')) {
            fs.mkdirSync('./data/assets');
        }
    },

    async createDatabase(database) {
        fs.writeFileSync(database, "{}");
    },

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

    async writeDataToDatabase(database, data) {
        if (typeof(data) !== "string") {
            data = JSON.stringify(data);
        }
        fs.writeFileSync(database, data);
    },

    async createFile(database, assetId, assetName, assetContent) {
        let fileName = `${assetId}.${assetName.substr(assetName.length-3,3)}`;
        let filePath = path.join(database, "../", `./assets/${fileName}`);
        fs.writeFileSync(filePath, new Buffer.from(assetContent));
    },

    async deleteFile(database, assetId, assetName) {
        let fileName = `${assetId}.${assetName.substr(assetName.length-3,3)}`;
        let filePath = path.join(database, "../", `./assets/${fileName}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    },



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



    async getToken(database) {
        let data = await this.readFromDatabase(database);
        if (data['token'] === undefined) {
            data['token'] = "";
            await this.writeDataToDatabase(database, data);
        }
        else return data['token'];
    },

    async addToken(database, token) {
        let data = await this.readFromDatabase(database);
        if (data['token'] === undefined) {
            data['token'] = "";
        }

        data['token'] = token;
        await this.writeDataToDatabase(database, data);
    },

    async removeToken(database) {
        let data = await this.readFromDatabase(database);
        data['token'] = "";
        await this.writeDataToDatabase(database, data);
    },



    async getUserCred(database) {
        let data = await this.readFromDatabase(database);
        if (data['clientId'] === undefined) data['clientId'] = "";
        if (data['twitchUsername'] === undefined) data['twitchUsername'] = "";
        await this.writeDataToDatabase(database, data);
        return {"clientId": data["clientId"], "twitchUsername": data["twitchUsername"]};
    },

    async addUserCred(database, clientId, twitchUsername) {
        let data = await this.readFromDatabase(database);
        if (data['clientId'] === undefined) data['clientId'] = "";
        if (data['twitchUsername'] === undefined) data['twitchUsername'] = "";

        data['clientId'] = clientId;
        data['twitchUsername'] = twitchUsername;
        await this.writeDataToDatabase(database, data);
    },

    async removeUserCred(database) {
        let data = await this.readFromDatabase(database);
        data['clientId'] = "";
        data['twitchUsername'] = "";
        await this.writeDataToDatabase(database, data);
    },
}

module.exports = dFuncs;