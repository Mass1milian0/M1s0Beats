const { SlashCommandBuilder } = require('discord.js');
const ytsr = require('ytsr');
const queueManager = require('../services/queueManager');
const { boomBoxManager } = require('../services/boomBoxManager');
const ytdl = require('ytdl-core');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song')
        .addStringOption(option => option.setName('song').setDescription('the song you want to play').setRequired(true)),
    async execute(interaction) {
        //differ the interaction
        await interaction.deferReply({ ephemeral: true});
        //get the song name
        const songName = interaction.options.getString('song');
        //check if the song name is a url
        let searchResults;
        if(!boomBoxManager.getMusicChannel()){
            interaction.editReply({ content: 'You need to set a music channel first, use the command /setmusicchannel', ephemeral: true });
            return;
        }
        await boomBoxManager.joinVoiceChannel(interaction)
        //list the results with buttons on the bottom to select the song
        if (songName.startsWith('https://www.youtube.com/watch?v=')) {
            //obtain video info
            searchResults = await ytdl.getInfo(songName);
            //add the song to the queue
            queueManager.enqueue({
                title: searchResults.videoDetails.title,
                url: searchResults.videoDetails.video_url,
                thumbnail: searchResults.videoDetails.thumbnails[0].url,
                requester: interaction.user.tag,
                guildid: interaction.guild.id,
                duration: searchResults.videoDetails.lengthSeconds,
                currentlyPlaying: false
            });
            boomBoxManager.playQueue();
            interaction.editReply({ content: 'The song has been added to the queue', ephemeral: true });
        } else {
            //search for the song
            searchResults = await ytsr(songName, { limit: 6 });
            boomBoxManager.setResultHolder(searchResults)
            let results = searchResults.items.map((item, index) => {
                if (item.type !== 'video') return;
                return {
                    label: item.title,
                    description: item.author.name,
                    value: "" + index,
                }
            });
            //remove the undefined elements
            results = results.filter(element => element !== undefined);
            //send the message
            await interaction.editReply({
                content: 'Select the song you want to play',
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: 'play',
                                options: results
                            }
                        ]
                    }
                ],
                ephemeral: true
            });
        }
    },
    async executeMenu(interaction) {
        //get the selected song
        const results = boomBoxManager.getResultHolder()
        const selectedSong = results.items[interaction.values[0]];
        //add the song to the queue
        queueManager.enqueue({
            title: selectedSong.title,
            url: selectedSong.url,
            thumbnail: selectedSong.bestThumbnail.url,
            requester: interaction.user.tag,
            guildid: interaction.guild.id,
            duration: selectedSong.duration,
            currentlyPlaying: false
        });
        //play the queue
        boomBoxManager.playQueue();
        //respond to the interaction so it' not marked as failed
        await interaction.reply({ content: 'The song has been added to the queue', ephemeral: true });
    }
};