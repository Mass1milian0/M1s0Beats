const Boombox = require('../classes/BoomboxHandler.js');
const discordVoice = require('@discordjs/voice');
const discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true
    }
});

client.login(process.env.TOKEN);

const boomBoxManager = new Boombox(discord,client,discordVoice,ytdl);
module.exports = {boomBoxManager,client};