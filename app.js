const config = require("./config")

//Tg bot
const TelegramBot = require('node-telegram-bot-api')
const token = config.botToken
const bot = new TelegramBot(token, {
    polling: true
});

var tg_chat_id;

//yt downloader converter
const ytdl = require('ytdl-core')
const  ffmpeg = require('fluent-ffmpeg');
const  { getInfo }  = require('ytdl-getinfo')
ffmpeg.setFfmpegPath(config.ffMpegPath)

videoUrl = "";
var saveLocation = "";

//Establishes the name of video
function saveName(){
    return new Promise((resolve) => getInfo(videoUrl).then(info => {
         saveLocation = "./"+info.items[0].title+".mp3";
         resolve();
     }))
 }

//Streams the video once the name has been established
 async function streaming(){
    await saveName();
    stream = ytdl(videoUrl)
 }
 
 //function to convert the file, once the stream and name are established
 async function convert(){
     await saveName();
     await streaming();
     new ffmpeg({ source: stream, nolog: true }).toFormat('mp3').audioBitrate(config.audioBitrate).on('end', function () {
         console.log('file has been converted successfully');
         bot.sendAudio(tg_chat_id, saveLocation) //sends the audio once it has been converted
         })
         .on('error', function(err) {
         console.log('an error happened: ' + err.message);
         })
         .saveToFile(saveLocation); 
 }

 //matches every youtube link
 bot.onText(/^(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+/gm, (msg) => {
    videoUrl = msg.text;
    convert();
});

//run this to initialize the bot
bot.onText(/\/run/, (msg) => {
    tg_chat_id = msg.chat.id;
    bot.sendMessage(tg_chat_id, "hello im a youtubeToMp3 bot, thanks for using me");
    
});

//delete every message except youtube urls
bot.onText(/^(?!(http(s)??\:\/\/)?(www\.)?((youtube\.com\/watch\?v=)|(youtu.be\/))([a-zA-Z0-9\-_])+)/gm, (msg) => {
    bot.deleteMessage(msg.chat.id,msg.message_id)
 })