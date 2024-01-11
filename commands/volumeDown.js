const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('volumedown')
        .setDescription('turn down the volume'),
    async execute(interaction) {
        //turn down the volume
        boomBoxManager.decreaseVolume();
        //reply but don't send anything just so the interaction is marked as done
        await interaction.deferUpdate()
    }
}