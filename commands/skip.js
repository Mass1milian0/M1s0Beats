const { SlashCommandBuilder } = require('discord.js');
const voiceInstance = require('../services/voiceInstance.js');
const queueInstance = require('../services/queueInstance.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song'),
    async execute(interaction) {
        //skip the song
        voiceInstance.stopAudio();
        queueInstance.queueSkip();
        //send the message
        await interaction.reply({content: `the current song has been skipped`, ephemeral: true});
    }
}