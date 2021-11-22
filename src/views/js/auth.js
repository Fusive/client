const { ipcRenderer, shell } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 80;

const handleLoad = () => {
    try {
        app.use(cors());

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../html/auth/index.html'));
        });
        app.post('/', (req, res) => {
            if (req.query.token) {
                res.sendStatus(200);
                ipcRenderer.send('auth:set', {token: req.query.token});
            }
            else {
                showAlert("An Error Has Occurred");
                res.sendStatus(400);
            }
        });

        app.listen(PORT, () => {});
    }
    catch (err) {
        showAlert(err.message);
    }

    let loginButton = document.getElementById("auth-login");
    loginButton.addEventListener('click', () => {
        shell.openExternal("https://id.twitch.tv/oauth2/authorize?client_id=iut2n8xxcvh8mtoedsk7357vsvyqbt&redirect_uri=http://localhost&response_type=token&scope=channel:read:redemptions");
        document.body.innerHTML = `
        <div id="loading">
            Opening Browser...
        </div>
        `;
    });

    var currentAlertTimeout;
    const showAlert = (text) => {
        if (currentAlertTimeout) {
            clearTimeout(currentAlertTimeout);
        }
        let alertElement = document.getElementById("alert");
        alertElement.innerText = text;
        alertElement.style.opacity = "1";
        alertElement.style.bottom = "3%";
        currentAlertTimeout = setTimeout(() => {
            alertElement.style.opacity = "0";
            alertElement.style.bottom = "-20%";
            currentAlertTimeout = undefined;
        }, 3000);
    }
}