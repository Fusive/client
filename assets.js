// Create Video Instances Here, Make Sure Everything Is Correct, Otherwise The Whole Program Might Crash

// Copy And Paste The Blocks To Add New Assets

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