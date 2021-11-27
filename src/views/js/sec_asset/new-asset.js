const { ipcRenderer } = require('electron');

const handleLoad = () => {
    var typeSelected;

    const assetTypeButtons = document.getElementsByClassName("asset-type-button");
    for (let i = 0; i < assetTypeButtons.length; ++i) {
        assetTypeButtons[i].addEventListener('click', e => {
            typeSelected = e.target.innerText;
            if (typeSelected === "VIDEO" || typeSelected === "AUDIO") {
                document.getElementById("asset-text-tts").remove();
                document.getElementById("asset-url").remove();
                document.getElementById("asset-text").remove();
                document.getElementById("asset-start").remove();
                document.getElementById("asset-end").remove();
                document.getElementById("asset-size").remove();
                document.getElementById("asset-color").remove();
                document.getElementById("asset-voice").remove();
                document.getElementById("asset-user-text").remove();
            }
            else if (typeSelected === "IMAGE/GIF") {
                document.getElementById("asset-text-tts").remove();
                document.getElementById("asset-url").remove();
                document.getElementById("asset-text").remove();
                document.getElementById("asset-volume").remove();
                document.getElementById("asset-start").remove();
                document.getElementById("asset-end").remove();
                document.getElementById("asset-size").remove();
                document.getElementById("asset-color").remove();
                document.getElementById("asset-voice").remove();
                document.getElementById("asset-user-text").remove();
            }
            else if (typeSelected === "VOICE") {
                document.getElementById("asset-file").remove();
                document.getElementById("asset-url").remove();
                document.getElementById("asset-text").remove();
                document.getElementById("asset-start").remove();
                document.getElementById("asset-end").remove();
                document.getElementById("asset-size").remove();
                document.getElementById("asset-color").remove();
            }
            else if (typeSelected === "YOUTUBE") {
                document.getElementById("asset-file").remove();
                document.getElementById("asset-text-tts").remove();
                document.getElementById("asset-text").remove();
                document.getElementById("asset-duration").remove();
                document.getElementById("asset-size").remove();
                document.getElementById("asset-color").remove();
                document.getElementById("asset-voice").remove();
                document.getElementById("asset-user-text").remove();
            }
            else if (typeSelected === "TEXT") {
                document.getElementById("asset-file").remove();
                document.getElementById("asset-text-tts").remove();
                document.getElementById("asset-url").remove();
                document.getElementById("asset-volume").remove();
                document.getElementById("asset-start").remove();
                document.getElementById("asset-end").remove();
                document.getElementById("asset-voice").remove();
            }

            if (typeSelected === "VIDEO") document.getElementById("asset-file-input").accept = ".mp4";
            if (typeSelected === "IMAGE/GIF") document.getElementById("asset-file-input").accept = ".jpg, .png, .gif";
            if (typeSelected === "AUDIO") document.getElementById("asset-file-input").accept = ".mp3";

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
        else if (typeSelected === "VIDEO" && !['.mp4'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
            logs.innerText = "Please select a valid file, possible files types are: .mp4";
            assetSelectedName = null;
            assetSelectedContent = null;
        }
        else if (typeSelected === "IMAGE/GIF" && !['.jpg', '.png', '.gif'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
            logs.innerText = "Please select a valid file, possible files types are: .jpg, .png and .gif";
            assetSelectedName = null;
            assetSelectedContent = null;
        }
        else if (typeSelected === "AUDIO" && !['.mp3'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
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
    let assetTextInput = document.getElementById("asset-text-input");
    assetUserTextSelect.addEventListener('change', e => {
        if (e.target.value === "false") {
            assetTextArea.disabled = false;
            assetTextArea.style.borderColor = "#ffffff";
            assetTextArea.style.color = "#ffffff";
            assetTextInput.disabled = false;
            assetTextInput.style.borderColor = "#ffffff";
            assetTextInput.style.color = "#ffffff";
        }
        else if (e.target.value === "true") {
            assetTextArea.disabled = true;
            assetTextArea.style.borderColor = "#444444";
            assetTextArea.style.color = "#444444";
            assetTextInput.disabled = true;
            assetTextInput.style.borderColor = "#444444";
            assetTextInput.style.color = "#444444";
        }
    });



    const getYoutubeId = (url) => {
        let regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
        let match = url.match(regExp);
        return (match&&match[1].length==11)? match[1] : false;
    };



    const checkColor = (color) => {
        if (color.length !== 6 && color.length !== 8) return false;
        else if (color.length === 6 || color.length === 8) {
            let r = parseInt(color.slice(0, 2), 16);
            let g = parseInt(color.slice(2, 4), 16);
            let b = parseInt(color.slice(4, 6), 16);
            let a = null;
            if (color.length === 8) a = parseInt(color.slice(6, 8), 16);
            if (r >= 0 && r < 256 && g >= 0 && g < 256 && b >= 0 && b < 256) {
                if (a !== null && a >= 0 && a < 256) return true;
                else if (a === null) return true;
            }
        }
        return false;
    };



    const saveButton = document.getElementById("asset-save-button");
    saveButton.addEventListener('click', e => {
        e.preventDefault();
        let data = {};
        if (typeSelected === "VIDEO") data['type'] = "Video";
        if (typeSelected === "AUDIO") data['type'] = "Audio";
        if (typeSelected === "VIDEO" || typeSelected === "AUDIO") {
            data['assetContent'] = assetSelectedContent;
            data['assetName'] = assetSelectedName;
            data['title'] = document.getElementById("asset-title-input").value;
            data['volume'] = document.getElementById("asset-volume-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;

            //Checks
            if (data['assetName'] === null) {
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
            data['assetContent'] = assetSelectedContent;
            data['assetName'] = assetSelectedName;
            data['title'] = document.getElementById("asset-title-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;

            //Checks
            if (data['assetName'] === null) {
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
        else if (typeSelected === "YOUTUBE") {
            data['type'] = "Youtube";
            data['url'] = document.getElementById("asset-url-input").value;
            data['title'] = document.getElementById("asset-title-input").value;
            data['volume'] = document.getElementById("asset-volume-input").value;
            data['duration'] = null;
            data['start'] = document.getElementById("asset-start-input").value;
            data['end'] = document.getElementById("asset-end-input").value;

            //Checks
            if (data['url'] === "" || !getYoutubeId(data['url'])) {
                showAlert("Please input a valid Youtube link");
                return;
            }
            else if (getYoutubeId(data['url'])) {
                data['url'] = getYoutubeId(data['url']);
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
            if (data['start'] !== "" && parseInt(data['start']) < 0) {
                showAlert("The start can't be a negative number");
                return;
            }
            if (data['end'] !== "" && parseInt(data['end']) < 0) {
                showAlert("The end can't be a negative number");
                return;
            }
            data['duration'] = (data['duration'] === "") ? null : parseInt(data['duration']);
            data['volume'] = parseInt(data['volume']);
            data['start'] = (data['start'] === "") ? null : parseInt(data['start']);
            data['end'] = (data['end'] === "") ? null : parseInt(data['end']);
        }
        else if (typeSelected === "TEXT") {
            data['type'] = "Text";
            data['text'] = document.getElementById("asset-text-input").value;
            data['title'] = document.getElementById("asset-title-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;
            data['size'] = document.getElementById("asset-size-input").value;
            data['color'] = document.getElementById("asset-color-input").value;
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
            if (data['title'] === "") {
                showAlert("Please fill the title field");
                return;
            }
            if (data['duration'] !== "" && parseInt(data['duration']) < 0) {
                showAlert("The duration can't be a negative number");
                return;
            }
            if (data['size'] !== "" && parseInt(data['size']) < 0) {
                showAlert("Size can't be a negative number");
                return;
            }
            else if (data['size'] !== "" && parseInt(data['size']) > 200) {
                showAlert("Size can't be grater than 200px");
                return;
            }
            if (data['color'] !== "" && !checkColor(data['color'])) {
                showAlert("Please insert a valid color");
                return;
            }
            data['duration'] = (data['duration'] === "") ? null : parseInt(data['duration']);
            data['size'] = (data['size'] === "") ? 60 : parseInt(data['size']);
            data['color'] = `#${data['color']}`;
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
}