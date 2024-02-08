const { SlashCommandBuilder } = require('discord.js');
const voiceInstance = require('../services/voiceInstance.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pauses the current song'),
    async execute(interaction) {
        //pause the song
        voiceInstance.pauseAudio();
        //send the message
        await interaction.reply({content: `Music Paused`, ephemeral: true});
    }
}