const { SlashCommandBuilder } = require('discord.js');
const voiceInstance = require('../services/voiceInstance.js');
const queueInstance = require('../services/queueInstance.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('disconnects the bot from the voice channel'),
    async execute(interaction) {
        //skip the song
        queueInstance.queueClear(true);
        voiceInstance.leaveVoiceChannel(interaction.guildId);
        //send the message
        await interaction.reply({content: `bot disconnected`, ephemeral: true});
    }
}