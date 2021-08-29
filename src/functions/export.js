const fs = require('fs');
const path = require('path');

const gFuncs = require('./general');

const eFuncs = {
    async createExportFolders() {
        if (!fs.existsSync('./out')) fs.mkdirSync('./out');
        if (!fs.existsSync('./out/css')) fs.mkdirSync('./out/css');
        if (!fs.existsSync('./out/js')) fs.mkdirSync('./out/js');
    },



    async createIndexFile(outFolder) {
        fs.writeFileSync(path.join(outFolder, "./index.html"), `<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta http-equiv="X-UA-Compatible" content="IE=edge">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<link rel="stylesheet" href="css/style.css">\n\t<title>Fusive Plugin</title>\n</head>\n<body onload="bodyLoaded()">\n\t<script src="js/config.js"></script>\n\t<script src="https://fusive.github.io/client/plugin/pluginScript.js" crossorigin="anonymous"></script>\n\t<script src="js/assets.js"></script>\n</body>\n</html>`);
    },



    async createStyleFile(outFolder) {
        fs.writeFileSync(path.join(outFolder, "./css/style.css"), `body, body * {\n\tmargin: 0;\n\tpadding: 0;\n}\n\nbody {\n\toverflow: hidden;\n}\n\nvideo, img {\n\tposition: absolute;\n\ttop: 50%;\n\tleft: 50%;\n\ttransform: translate(-50%, -50%);\n\twidth: 100vw;\n\theight: 100vh;\n}\n\nimg {\n\tobject-fit: contain;\n}`);
    },



    async createAssetsFile(outFolder, assets) {
        let fileText = "";
        for (let i = 0; i < assets.length; ++i) {
            switch (assets[i]['type']) {
                case "Video":
                    fileText += "new socketVideo(\n\t";
                    break;
                case "Image/Gif":
                    fileText += "new socketImage(\n\t";
                    break;
                case "Audio":
                    fileText += "new socketAudio(\n\t";
                    break;
                case "Voice":
                    fileText += "new socketVoice(\n\t";
                    break;
            }

            fileText += `title = "${assets[i]['title']}",\n\t`;

            if (assets[i]['type'] === "Video" || assets[i]['type'] === "Image/Gif" || assets[i]['type'] === "Audio") {
                fileText += `asset = "${assets[i]['id']}.${assets[i]['assetName'].substr(assets[i]['assetName'].length-3,3)}",\n\t`;
            }
            else if (assets[i]['type'] === "Voice") {
                fileText += `asset = "${assets[i]['text']}",\n\t`;
            }

            fileText += `duration = ${assets[i]['duration']},\n\t`;

            if (assets[i]['type'] === "Video" || assets[i]['type'] === "Audio" || assets[i]['type'] === "Voice") {
                fileText += `volume = ${(assets[i]['volume']/100).toFixed(3)},\n\t`;
            }

            if (assets[i]['type'] === "Video" || assets[i]['type'] === "Image/Gif" || assets[i]['type'] === "Audio") {
                fileText += `local = ${assets[i]['local']}\n`;
            }
            else if (assets[i]['type'] === "Voice") {
                fileText += `voice = "${assets[i]['voice']}",\n\t`;
                fileText += `userText = ${assets[i]['userText']}\n`;
            }

            fileText += ");\n\n";
        }

        if (fileText !== "") {
            fs.writeFileSync(path.join(outFolder, "./js/assets.js"), fileText);
        }
    },
}

module.exports = eFuncs;