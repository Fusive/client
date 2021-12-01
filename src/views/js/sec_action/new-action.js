const { ipcRenderer } = require('electron');

const handleLoad = () => {
    ipcRenderer.send('credentials:get');

    ipcRenderer.on('credentials:get', (e, cred) => {
        if (cred['scopes'].includes("channel:moderate") && cred['scopes'].includes("chat:edit") && cred['scopes'].includes("chat:read")) {
            document.getElementById("action-ban").disabled = false;
            document.getElementById("action-unban").disabled = false;
            document.getElementById("action-timeout").disabled = false;
            document.getElementById("action-untimeout").disabled = false;
            document.getElementById("action-vip").disabled = false;
            document.getElementById("action-unmod").disabled = false;
        }
        if (cred['scopes'].includes("channel:manage:polls") && cred['scopes'].includes("channel:read:polls")) {}
        if (cred['scopes'].includes("channel:manage:predictions") && cred['scopes'].includes("channel:read:predictions")) {}
    });

    var typeSelected;

    const actionTypeButtons = document.getElementsByClassName("action-type-button");
    for (let i = 0; i < actionTypeButtons.length; ++i) {
        actionTypeButtons[i].addEventListener('click', e => {
            typeSelected = e.target.innerText;
            if (typeSelected !== "BAN" && typeSelected !== "TIMEOUT") {
                document.getElementById("action-reason").remove();
            }

            let actionTypeMenu = document.getElementById("action-type");
            actionTypeMenu.style.opacity = "0";
            setTimeout(() => {
                actionTypeMenu.remove();
            }, 300);
        });
    }

    document.getElementById("return-button").addEventListener('click', () => {
        location.reload();
    });





    const saveButton = document.getElementById("action-save-button");
    saveButton.addEventListener('click', e => {
        e.preventDefault();
        let data = {};
        if (typeSelected === "BAN") data['type'] = "Ban";
        if (typeSelected === "UNBAN") data['type'] = "Unban";
        if (typeSelected === "TIMEOUT") data['type'] = "Timeout";
        if (typeSelected === "UNTIMEOUT") data['type'] = "Untimeout";
        if (typeSelected === "VIP") data['type'] = "VIP";
        if (typeSelected === "UNMOD") data['type'] = "Unmod";
        if (typeSelected === "BAN" || typeSelected === "TIMEOUT") {
            data['reason'] = document.getElementById("action-reason-input").value;
        }

        data['title'] = document.getElementById("action-title-input").value;
        data['min-time'] = document.getElementById("action-min-time-input").value;
        data['max-time'] = document.getElementById("action-max-time-input").value;

        //Checks
        if (data['title'] === "") {
            showAlert("Please fill the title field");
            return;
        }
        if (data['min-time'] === "") {
            showAlert("Please fill the min time field");
            return;
        }
        else if (data['min-time'] !== "" && parseInt(data['min-time']) < 0) {
            showAlert("The min time can't be a negative number");
            return;
        }
        if (data['max-time'] === "") {
            showAlert("Please fill the max time field");
            return;
        }
        else if (data['max-time'] !== "" && parseInt(data['max-time']) < 0) {
            showAlert("The max time can't be a negative number");
            return;
        }

        document.body.innerHTML = `
        <div id="loading">
            Saving...
        </div>
        `;
        let loadingText = document.getElementById('loading');
        setInterval(() => {
            if (loadingText.innerText.substr(loadingText.innerText.length-3, 3) === "...") {
                loadingText.innerText = loadingText.innerText.substring(0, loadingText.innerText.length-3)
            }
            else {
                loadingText.innerText = `${loadingText.innerText}.`
            }
        }, 350);

        ipcRenderer.send('action:new', data);
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