const { SlashCommandBuilder } = require('discord.js');
const {boomBoxManager} = require('../services/boomBoxManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmusicchannel')
        .setDescription('set the music channel')
        .addChannelOption(option => option.setName('channel').setDescription('the channel you want to set').setRequired(true)),
    async execute(interaction) {
        //get the channel
        const channel = interaction.options.getChannel('channel');
        //set the channel
        boomBoxManager.setMusicChannel(channel);
        //send the message
        await interaction.reply(`the music channel is now set to ${channel}`, { ephemeral: true });
    }
}