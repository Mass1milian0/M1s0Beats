const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('show the queue'),
    async execute(interaction) {
        //pause the music
        let embeeds = boomBoxManager.getQueueEmbed();
        if(embeeds.length === 0) {
            await interaction.reply({content: 'The queue is empty', ephemeral: true});
            return;
        }
        await interaction.reply({embeds: embeeds, ephemeral: true});
    }
};