const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip the current song'),
    async execute(interaction) {
        //skip the song
        boomBoxManager.skipSong();
        //send the message
        await interaction.deferUpdate()
    }
}