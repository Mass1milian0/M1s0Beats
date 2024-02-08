const { SlashCommandBuilder } = require('discord.js');
const queueInstance = require('../services/queueInstance.js');
const embeedCreator = require('../classes/embeedCreator.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('shows the current queue'),
    async execute(interaction) {
        let queue = queueInstance.getQueue();
        if (queue.length == 0) {
            await interaction.reply({content: `The queue is empty`, ephemeral: true});
            return;
        }
        let embeds = [];
        for(let song of queue) {
            let embed = await embeedCreator({
                title: song.title,
                thumbnail: song.thumbnail,
                fields: [
                    {name: "position", value: `${queue.indexOf(song) + 1}`, inline: true},
                    {name: "requester", value: song.requester, inline: true},
                    {name: "duration", value: song.duration, inline: true}
                ]
            });
            embeds.push(embed);
        }
        //send the message
        await interaction.reply({embeds: embeds , ephemeral: true});
    }
}