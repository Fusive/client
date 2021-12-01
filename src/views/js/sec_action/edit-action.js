const { ipcRenderer } = require('electron');

const handleLoad = () => {
    var action;

    ipcRenderer.on('action:edit', (e, reqAction) => {
        action = reqAction;

        if (action['type'] !== "Ban" && action['type'] !== "Timeout") {
            document.getElementById("action-reason").remove();
        }
        else if (action['reason']) {
            document.getElementById("action-reason-input").value = `${action['reason']}`;
        }
        document.getElementById("action-title-input").value = `${action['title']}`;
        document.getElementById("action-min-time-input").value = `${action['min-time']}`;
        document.getElementById("action-max-time-input").value = `${action['max-time']}`;





        const saveButton = document.getElementById("action-save-button");
        saveButton.addEventListener('click', e => {
            e.preventDefault();
            let data = action;
            if (data['type'] === "Ban" || data['type'] === "Timeout") {
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

            ipcRenderer.send('action:edit-save', data);
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
    });
}