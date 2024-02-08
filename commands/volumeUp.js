const { SlashCommandBuilder } = require('discord.js');
const voiceInstance = require('../services/voiceInstance.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('volumeup')
        .setDescription('increase the volume by 10%'),
    async execute(interaction) {
        //skip the song
        let current = voiceInstance.getVolume();
        if (current < 1) {
            voiceInstance.setVolume(current + 0.1);
        }
        //send the message
        await interaction.deferUpdate();
    }
}