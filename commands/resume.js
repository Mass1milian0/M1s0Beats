const { SlashCommandBuilder } = require('discord.js');
const voiceInstance = require('../services/voiceInstance.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resumes the current song'),
    async execute(interaction) {
        //skip the song
        voiceInstance.resumeAudio();
        //send the message
        await interaction.reply({content: `Music Resumed`, ephemeral: true});
    }
}