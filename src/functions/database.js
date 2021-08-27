const fs = require('fs');
const path = require('path');

const gFuncs = require('./general');

const dFuncs = {
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

    async getAssets(database) {
        let data = await this.readFromDatabase(database);
        if (data['assets'] === undefined) {
            data['assets'] = [];
            await this.writeDataToDatabase(database, data);
        }
        return data['assets'];
    },

    async addAsset(database, asset) {
        let data = await this.readFromDatabase(database);
        if (data['assets'] === undefined) {
            data['assets'] = [];
        }
        data['assets'].push(asset);
        await this.writeDataToDatabase(database, data);
    },

    async deleteAsset(database, id) {
        let data = await this.readFromDatabase(database);
        if (data['assets'] !== undefined) {
            for (let i = 0; i < data['assets'].length; ++i) {
                if (data['assets'][i]['id'] == id) {
                    if (data['assets'][i]['assetName']) {
                        let fileName = `${data['assets'][i]['id']}.${data['assets'][i]['assetName'].substr(data['assets'][i]['assetName'].length-3,3)}`;
                        let filePath = path.join(database, "../", `./assets/${fileName}`);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }

                    data['assets'].splice(i, 1);
                    await this.writeDataToDatabase(database, data);
                    return true;
                }
            }
        }
        return false;
    },
}

module.exports = dFuncs;