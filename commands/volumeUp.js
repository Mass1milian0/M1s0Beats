const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('volumeup')
        .setDescription('turn up the volume'),
    async execute(interaction) {
        //turn up the volume
        boomBoxManager.increaseVolume();
        //send the message
        await interaction.deferUpdate()
    }
}