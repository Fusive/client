// Create Video Instances Here, Make Sure Everything Is Correct, Otherwise The Whole Program Might Crash

// ADD A VIDEO
new socketVideo(
    title = "Video Test", // Here You Put The Name Of The Channel Points Redemption
    asset = "test.mp4", // Here You Put The Name And Extension Of The File
    duration = null, // Here You Put The Duration Of The Video, Gif, Image, Audio Or Voice In Seconds, Put Null If It's A Video And You Want It To Last As Long As The Video Can
    volume = 0.5, // Here You Put The Volume Of The Video (0 Is Mute, 1 Is Loudest)
    local = true // If Local Is true The Video Must Be A Local File Stored In The Assets Folder, If It's false The Video Must Be A URL To The Video File
);

// ADD A GIF OR IMAGE
new socketImage(
    title = "Coggers Gif", 
    asset = "https://media.tenor.com/images/377174336ccfc5280ba2dd954ef04ca5/tenor.gif", 
    duration = 7,
    local = false
);

// ADD A AUDIO
new socketAudio(
    title = "Bruh Sound",
    asset = "https://www.myinstants.com/media/sounds/movie_1_C2K5NH0.mp3",
    duration = null,
    volume = 0.4,
    local = false
);

// ADD A VOICE
new socketVoice(
    title = "Hydrate",
    asset = "You gotta drink water", // Here You Put What You Want The Text To Speech To Say
    duration = null,
    volume = 1,
    voice = null, // Your PC Has Different Voices Downloaded, You Can Put A Number Between 0 And The Amount Of Voices You Have, If You Leave It At null Or Put A Number Grater Than The Number Of Voices You Have The Default Voice Will Be Selected Instead
    pitch = 1, // This Is The Pitch Of The Voice, Choose A Number Between 0 And 2
    rate = 1, // This Is The Rate At Which The Voice Will Speak, Choose A Number Between 0.1 And 10
    userText = false // You Can Turn The Channel Point Redemption To A Prompted One So The User Can Write Some Text When It's Redeemed, If You Change This Option To true, What The User Wrote Will Be Said By The Text To Speech
);

// ADD A VOICE INPUT BY USER
new socketVoice(
    title = "Say Something",
    asset = "", // If You Put true To The userText Option It Will Not Matter What You Write Here
    duration = null,
    volume = 1,
    voice = null,
    pitch = 1,
    rate = 1,
    userText = true
);