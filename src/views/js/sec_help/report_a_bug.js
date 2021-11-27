const { shell } = require('electron');

const linkClick = (link) => {
    shell.openExternal(link);
};