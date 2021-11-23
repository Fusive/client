const { ipcRenderer } = require('electron');

const handleLoad = () => {
    var asset;

    ipcRenderer.on('asset:edit', (e, reqAsset) => {
        asset = reqAsset;

        if (asset['type'] === "Video" || asset['type'] === "Audio") {
            document.getElementById("asset-text").remove();
            document.getElementById("asset-voice").remove();
            document.getElementById("asset-user-text").remove();
            document.getElementById("asset-file-logs").innerText = `File selected: ${asset['assetName']}`;
            document.getElementById("asset-volume-input").value = asset['volume'];
        }
        else if (asset['type'] === "Image/Gif") {
            document.getElementById("asset-text").remove();
            document.getElementById("asset-volume").remove();
            document.getElementById("asset-voice").remove();
            document.getElementById("asset-user-text").remove();
            document.getElementById("asset-file-logs").innerText = `File selected: ${asset['assetName']}`;
        }
        else if (asset['type'] === "Voice") {
            document.getElementById("asset-file").remove();
            if (asset['text'] !== null) {
                document.getElementById("asset-text-area").value = asset['text'];
                document.getElementById("asset-text-count").innerText = `${asset['text'].length} / 200`;
            }
            document.getElementById("asset-volume-input").value = asset['volume'];
            document.getElementById("asset-user-text-input").value = asset['userText'];
        }

        if (asset['type'] === "Video") document.getElementById("asset-file-input").accept = ".mp4";
        if (asset['type'] === "Image/Gif") document.getElementById("asset-file-input").accept = ".jpg, .png, .gif";
        if (asset['type'] === "Audio") document.getElementById("asset-file-input").accept = ".mp3";

        document.getElementById("asset-title-input").value = asset['title'];
        document.getElementById("asset-duration-input").value = asset['duration'];



        if (asset['type'] === "Voice") {
            let languageOptions = [["af", "Afrikaans"], ["sq", "Albanian"], ["ar", "Arabic"], ["hy", "Armenian"], ["bn", "Bengali"], ["bs", "Bosnian"], ["bg", "Bulgarian"], ["ca", "Catalan"], ["zh", "Chinese"], ["hr", "Croatian"], ["cs", "Czech"], ["da", "Danish"], ["nl", "Dutch"], ["en", "English"], ["eo", "Esperanto"], ["et", "Estonian"], ["fil", "Filipino"], ["fi", "Finnish"], ["fr", "French"], ["de", "German"], ["el", "Greek"], ["gu", "Gujarati"], ["hi", "Hindi"], ["hu", "Hungarian"], ["is", "Icelandic"], ["id", "Indonesian"], ["it", "Italian"], ["ja", "Japanese"], ["jv", "Javanese"], ["kn", "Kannada"], ["km", "Khmer"], ["ko", "Korean"], ["la", "Latin"], ["lv", "Latvian"], ["mk", "Macedonian"], ["ms", "Malay"], ["ml", "Malayalam"], ["mr", "Marathi"], ["my", "Myanmar (Burmese)"], ["ne", "Nepali"], ["no", "Norwegian"], ["pl", "Polish"], ["pt", "Portuguese"], ["ro", "Romanian"], ["ru", "Russian"], ["sr", "Serbian"], ["si", "Sinhala"], ["sk", "Slovak"], ["es", "Spanish"], ["su", "Sundanese"], ["sw", "Swahili"], ["sv", "Swedish"], ["ta", "Tamil"], ["te", "Telugu"], ["th", "Thai"], ["tr", "Turkish"], ["uk", "Ukrainian"], ["ur", "Urdu"], ["vi", "Vietnamese"], ["cy", "Welsh"]];
            for (let i = 0; i < languageOptions.length; ++i) {
                let option = document.createElement("option");
                option.value = languageOptions[i][0];
                option.innerText = languageOptions[i][1];
                if (languageOptions[i][0] == asset['voice']) {
                    option.selected = true;
                }
                document.getElementById("asset-voice-input").appendChild(option);
            }

            const assetTextArea = document.getElementById("asset-text-area");
            const assetTextCount = document.getElementById("asset-text-count");
            assetTextArea.addEventListener('input', e => {
                assetTextCount.innerText = `${e.target.value.length} / 200`;
            });

            let assetUserTextLabel = document.getElementById("asset-user-text-label");
            let assetUserTextTooltip = document.getElementById("asset-user-text-tooltip");
            assetUserTextLabel.addEventListener('mouseover', () => {
                assetUserTextTooltip.style.display = "inline";
            });
            assetUserTextLabel.addEventListener('mouseout', () => {
                assetUserTextTooltip.style.display = "none";
            });

            let assetUserTextSelect = document.getElementById("asset-user-text-input");
            const checkUserTextSelected = () => {
                console.log("testing");
                if (assetUserTextSelect.value === "false") {
                    assetTextArea.disabled = false;
                    assetTextArea.style.borderColor = "#ffffff";
                    assetTextArea.style.color = "#ffffff";
                }
                else if (assetUserTextSelect.value === "true") {
                    assetTextArea.disabled = true;
                    assetTextArea.style.borderColor = "#444444";
                    assetTextArea.style.color = "#444444";
                }
            }
            assetUserTextSelect.addEventListener('change', () => checkUserTextSelected());
            checkUserTextSelected();
        }



        if (asset['type'] !== "Voice") {
            var assetSelectedName = null;
            var assetSelectedContent = null;
            const assetInput = document.getElementById("asset-file-input");
            assetInput.addEventListener('change', () => {
                if (assetInput.files.length === 0) {
                    return;
                }
                let logs = document.getElementById("asset-file-logs");
                if (assetInput.files.length !== 1) {
                    logs.innerText = "Please select only one file";
                    assetSelectedName = null;
                    assetSelectedContent = null;
                }
                if (assetInput.files[0].size > 100*1024*1024) {
                    logs.innerText = "Max file size: 100mb";
                    assetSelectedName = null;
                    assetSelectedContent = null;
                }
                else if (asset['type'] === "VIDEO" && !['.mp4'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
                    logs.innerText = "Please select a valid file, possible files types are: .mp4";
                    assetSelectedName = null;
                    assetSelectedContent = null;
                }
                else if (asset['type'] === "IMAGE/GIF" && !['.jpg', '.png', '.gif'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
                    logs.innerText = "Please select a valid file, possible files types are: .jpg, .png and .gif";
                    assetSelectedName = null;
                    assetSelectedContent = null;
                }
                else if (asset['type'] === "AUDIO" && !['.mp3'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
                    logs.innerText = "Please select a valid file, possible files types are: .mp3";
                    assetSelectedName = null;
                    assetSelectedContent = null;
                }
                else {
                    assetSelectedName = assetInput.files[0].name;
                    logs.innerText = `File selected: ${assetSelectedName}`;

                    var reader = new FileReader();
                    reader.onload = e => {
                        assetSelectedContent = e.target.result;
                    }
                    reader.readAsArrayBuffer(assetInput.files[0]);
                }
            });
        }





        const saveButton = document.getElementById("asset-save-button");
        saveButton.addEventListener('click', e => {
            e.preventDefault();
            let data = asset;
            if (data['type'] === "Video" || data['type'] === "Audio") {
                data['assetNamePrevious'] = data['assetName'];
                data['assetContent'] = assetSelectedContent;
                data['assetName'] = assetSelectedName;
                data['title'] = document.getElementById("asset-title-input").value;
                data['volume'] = document.getElementById("asset-volume-input").value;
                data['duration'] = document.getElementById("asset-duration-input").value;

                //Checks
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
            else if (data['type'] === "Image/Gif") {
                data['assetNamePrevious'] = data['assetName'];
                data['assetContent'] = assetSelectedContent;
                data['assetName'] = assetSelectedName;
                data['title'] = document.getElementById("asset-title-input").value;
                data['duration'] = document.getElementById("asset-duration-input").value;

                //Checks
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
            else if (data['type'] === "Voice") {
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

            ipcRenderer.send('asset:edit-save', data);
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