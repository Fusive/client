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
            res.sendFile(path.join(__dirname, '../../html/sec_auth/public/index.html'));
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

        app.listen(PORT, () => {}).on('error', err => {
            document.getElementById("auth-login").disabled = true;
            if (err.message === "listen EADDRINUSE: address already in use :::80") showAlert("Port 80 Already In Use, Please Close Conflict Apps");
            else showAlert(err.message);
        });
    }
    catch (err) {
        document.getElementById("auth-login").disabled = true;
        showAlert(err.message);
    }

    let loginButton = document.getElementById("auth-login");
    loginButton.addEventListener('click', () => {
        let elements = document.getElementsByClassName("auth-input-checkbox");
        let scopes = [];
        for (let i = 0; i < elements.length; ++i) {
            if (elements[i].checked) {
                let element = elements[i].parentElement.innerText.trim();
                switch(element) {
                    case "Read Channel Points":
                        scopes.push("channel:read:redemptions");
                        break;
                    case "Manage And Read Polls":
                        scopes.push("channel:manage:polls+channel:read:polls");
                        break;
                    case "Manage And Read Predictions":
                        scopes.push("channel:manage:predictions+channel:read:predictions");
                        break;
                    case "Channel Moderation":
                        scopes.push("channel:moderate");
                        break;
                    case "Channel Read And Edit":
                        scopes.push("chat:edit+chat:read");
                        break;
                }
            }
        }
        scopes = scopes.join("+");
        shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=iut2n8xxcvh8mtoedsk7357vsvyqbt&redirect_uri=http://localhost&response_type=token&scope=${scopes}`);
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