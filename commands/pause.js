const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('pause the music'),
    async execute(interaction) {
        //pause the music
        boomBoxManager.pauseSong();
        //send the message
        await interaction.deferUpdate()
    }
}