const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('resume the music'),
    async execute(interaction) {
        //resume the music
        boomBoxManager.resumeSong();
        //send the message
        await interaction.deferUpdate()
    }
}