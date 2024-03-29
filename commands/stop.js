const { SlashCommandBuilder } = require('discord.js');
const voiceInstance = require('../services/voiceInstance.js');
const queueInstance = require('../services/queueInstance.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stops the player and clears the queue'),
    async execute(interaction) {
        //skip the song
        voiceInstance.stopAudio();
        queueInstance.queueClear();
        //send the message
        await interaction.reply({content: `player stopped and queue cleared`, ephemeral: true});
    }
}