const { ipcRenderer } = require('electron');

const handleLoad = () => {
    var typeSelected;

    const assetTypeButtons = document.getElementsByClassName("asset-type-button");
    for (let i = 0; i < assetTypeButtons.length; ++i) {
        assetTypeButtons[i].addEventListener('click', e => {
            typeSelected = e.target.innerText;
            if (typeSelected === "VIDEO" || typeSelected === "AUDIO") {
                document.getElementById("asset-text").remove();
                document.getElementById("asset-voice").remove();
                document.getElementById("asset-user-text").remove();
            }
            else if (typeSelected === "IMAGE/GIF") {
                document.getElementById("asset-text").remove();
                document.getElementById("asset-volume").remove();
                document.getElementById("asset-voice").remove();
                document.getElementById("asset-user-text").remove();
            }
            else if (typeSelected === "VOICE") {
                document.getElementById("asset-file").remove();
            }

            let assetTypeMenu = document.getElementById("asset-type");
            assetTypeMenu.style.opacity = "0";
            setTimeout(() => {
                assetTypeMenu.remove();
            }, 300);
        });
    }

    document.getElementById("return-button").addEventListener('click', () => {
        location.reload();
    });



    var assetSelected = null;
    const assetInput = document.getElementById("asset-file-input");
    assetInput.addEventListener('change', () => {
        if (assetInput.files.length === 0) {
            return;
        }
        let logs = document.getElementById("asset-file-logs");
        if (assetInput.files.length !== 1) {
            logs.innerText = "Please select onle one file";
            assetSelected = null;
        }
        if (!['.mp4', '.jpg', '.png', '.gif', '.mp3'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
            logs.innerText = "Please select a valid file, possible files are: .mp4, .jpg, .png, .gif and .mp3";
            assetSelected = null;
        }
        else {
            assetSelected = assetInput.files[0].name
            logs.innerText = `File selected: ${assetSelected}`;
        }
    });



    const assetTextArea = document.getElementById("asset-text-area");
    const assetTextCount = document.getElementById("asset-text-count");
    assetTextArea.addEventListener('input', e => {
        assetTextCount.innerText = `${e.target.value.length} / 200`;
    });



    let voiceSelect = document.getElementById("asset-voice-input");
    let languageOptions = [["af", "Afrikaans"], ["sq", "Albanian"], ["ar", "Arabic"], ["hy", "Armenian"], ["bn", "Bengali"], ["bs", "Bosnian"], ["bg", "Bulgarian"], ["ca", "Catalan"], ["zh", "Chinese"], ["hr", "Croatian"], ["cs", "Czech"], ["da", "Danish"], ["nl", "Dutch"], ["en", "English"], ["eo", "Esperanto"], ["et", "Estonian"], ["fil", "Filipino"], ["fi", "Finnish"], ["fr", "French"], ["de", "German"], ["el", "Greek"], ["gu", "Gujarati"], ["hi", "Hindi"], ["hu", "Hungarian"], ["is", "Icelandic"], ["id", "Indonesian"], ["it", "Italian"], ["ja", "Japanese"], ["jv", "Javanese"], ["kn", "Kannada"], ["km", "Khmer"], ["ko", "Korean"], ["la", "Latin"], ["lv", "Latvian"], ["mk", "Macedonian"], ["ms", "Malay"], ["ml", "Malayalam"], ["mr", "Marathi"], ["my", "Myanmar (Burmese)"], ["ne", "Nepali"], ["no", "Norwegian"], ["pl", "Polish"], ["pt", "Portuguese"], ["ro", "Romanian"], ["ru", "Russian"], ["sr", "Serbian"], ["si", "Sinhala"], ["sk", "Slovak"], ["es", "Spanish"], ["su", "Sundanese"], ["sw", "Swahili"], ["sv", "Swedish"], ["ta", "Tamil"], ["te", "Telugu"], ["th", "Thai"], ["tr", "Turkish"], ["uk", "Ukrainian"], ["ur", "Urdu"], ["vi", "Vietnamese"], ["cy", "Welsh"]];
    for (let i = 0; i < languageOptions.length; ++i) {
        let option = document.createElement("option");
        option.value = languageOptions[i][0];
        option.innerText = languageOptions[i][1];
        if (languageOptions[i][1] == "English") {
            option.selected = true;
        }
        voiceSelect.appendChild(option);
    }



    let assetUserTextLabel = document.getElementById("asset-user-text-label");
    let assetUserTextTooltip = document.getElementById("asset-user-text-tooltip");
    assetUserTextLabel.addEventListener('mouseover', () => {
        assetUserTextTooltip.style.display = "inline";
    });
    assetUserTextLabel.addEventListener('mouseout', () => {
        assetUserTextTooltip.style.display = "none";
    });

    let assetUserTextSelect = document.getElementById("asset-user-text-input");
    assetUserTextSelect.addEventListener('change', e => {
        if (e.target.value === "false") {
            assetTextArea.disabled = false;
            assetTextArea.style.borderColor = "#ffffff";
            assetTextArea.style.color = "#ffffff";
        }
        else if (e.target.value === "true") {
            assetTextArea.disabled = true;
            assetTextArea.style.borderColor = "#444444";
            assetTextArea.style.color = "#444444";
        }
    });



    const saveButton = document.getElementById("asset-save-button");
    saveButton.addEventListener('click', e => {
        e.preventDefault();
        let data = {};
        if (typeSelected === "VIDEO") data['type'] = "Video";
        if (typeSelected === "AUDIO") data['type'] = "Audio";
        if (typeSelected === "VIDEO" || typeSelected === "AUDIO") {
            data['asset'] = assetSelected;
            data['title'] = document.getElementById("asset-title-input").value;
            data['volume'] = document.getElementById("asset-volume-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;

            //Checks
            if (data['asset'] === null) {
                showAlert("Please add a file");
                return;
            }
            if (data['title'] === "") {
                showAlert("Please fill the title field");
                return;
            }
            if (data['volume'] === "") {
                showAlert("Please fill the volume field");
                return;
            }
            else if (parseInt(data['volume']) > 100 || parseInt(data['volume']) < 0) {
                showAlert("The volume field needs a value between 0 and 100");
                return;
            }
            if (data['duration'] !== "" && parseInt(data['duration']) < 0) {
                showAlert("The duration can't be a negative number");
                return;
            }
            data['duration'] = (data['duration'] === "") ? null : parseInt(data['duration']);
            data['volume'] = parseInt(data['volume']);
        }
        else if (typeSelected === "IMAGE/GIF") {
            data['type'] = "Image/Gif";
            data['asset'] = assetSelected;
            data['title'] = document.getElementById("asset-title-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;

            //Checks
            if (data['asset'] === null) {
                showAlert("Please add a file");
                return;
            }
            if (data['title'] === "") {
                showAlert("Please fill the title field");
                return;
            }
            if (data['duration'] === "") {
                showAlert("Please fill the duration field");
                return;
            }
            if (parseInt(data['duration']) < 0) {
                showAlert("The duration can't be a negative number");
                return;
            }
            data['duration'] = parseInt(data['duration']);
        }
        else if (typeSelected === "VOICE") {
            data['type'] = "Voice";
            data['text'] = document.getElementById("asset-text-area").value;
            data['title'] = document.getElementById("asset-title-input").value;
            data['volume'] = document.getElementById("asset-volume-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;
            data['voice'] = document.getElementById("asset-voice-input").value;
            data['userText'] = document.getElementById("asset-user-text-input").value;

            //Checks
            data['userText'] = data['userText'] == "true";
            if (data['text'] === "" && data['userText'] === false) {
                showAlert("Please fill the text to read field");
                return;
            }
            else if (data['userText'] === true) {
                data['text'] = null;
            }
            else if (data['text'].length > 200) {
                showAlert("Max length for text to read is 200 characters");
                return;
            }
            if (data['title'] === "") {
                showAlert("Please fill the title field");
                return;
            }
            if (data['volume'] === "") {
                showAlert("Please fill the volume field");
                return;
            }
            else if (parseInt(data['volume']) > 100 || parseInt(data['volume']) < 0) {
                showAlert("The volume field needs a value between 0 and 100");
                return;
            }
            if (data['duration'] !== "" && parseInt(data['duration']) < 0) {
                showAlert("The duration can't be a negative number");
                return;
            }
            data['duration'] = (data['duration'] === "") ? null : parseInt(data['duration']);
            data['volume'] = parseInt(data['volume']);
        }
        let output = "";
        for (i in data) {
            output += `${i}: ${data[i]}\n`;
        }
        showAlert(output);
        ipcRenderer.send('asset:new', data);
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



    ipcRenderer.on('process:loading', e => {
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
    });
}