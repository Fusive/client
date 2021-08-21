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



    const assetInput = document.getElementById("asset-file-input");
    assetInput.addEventListener('change', () => {
        if (assetInput.files.length === 0) {
            return;
        }
        let logs = document.getElementById("asset-file-logs");
        if (assetInput.files.length !== 1) {
            logs.innerText = "Please select onle one file";
        }
        if (['.mp4', '.jpg', '.png', '.gif', '.mp3'].includes(assetInput.files[0].name.substr(assetInput.files[0].name.length-4, 4))) {
            logs.innerText = `File selected: ${assetInput.files[0].name}`;
        }
        else {
            logs.innerText = "Please select a valid file, possible files are: .mp4, .jpg, .png, .gif and .mp3";
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
        if (typeSelected === "VIDEO" || typeSelected === "AUDIO") {
            data['title'] = document.getElementById("asset-title-input").value;
            data['volume'] = document.getElementById("asset-volume-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;
        }
        else if (typeSelected === "IMAGE/GIF") {
            data['title'] = document.getElementById("asset-title-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;
        }
        else if (typeSelected === "VOICE") {
            data['text'] = document.getElementById("asset-text-area").value;
            data['title'] = document.getElementById("asset-title-input").value;
            data['volume'] = document.getElementById("asset-volume-input").value;
            data['duration'] = document.getElementById("asset-duration-input").value;
            data['voice'] = document.getElementById("asset-voice-input").value;
            data['userText'] = document.getElementById("asset-user-text-input").value;
        }
        document.body.innerHTML = "";
        for (i in data) {
            document.body.innerHTML += `${i}: ${data[i]}<br/>`;
        }
    });
}