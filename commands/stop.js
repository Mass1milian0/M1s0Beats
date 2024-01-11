const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');
const queueManager = require("../services/queueManager");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stop the music'),
    async execute(interaction) {
        //stop the music
        queueManager.clearQueue();
        boomBoxManager.stopSong();
        //send the message
        await interaction.deferUpdate()
    }
}