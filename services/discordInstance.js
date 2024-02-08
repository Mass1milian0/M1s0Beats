const discordController = require('../classes/discordController.js');
const {Client, GatewayIntentBits} = require('discord.js');
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

const discordInstance = new discordController(client);
module.exports = {discordInstance, client};