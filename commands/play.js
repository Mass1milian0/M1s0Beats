const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const queueInstance = require('../services/queueInstance.js');
const youtubeSearcherInstance = require('../services/youtubeSearcherInstance.js');
const voiceInstance = require('../services/voiceInstance.js');
const ytdl = require('ytdl-core');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song')
        .addStringOption(option => option.setName('song').setDescription('the song you want to play').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const songName = interaction.options.getString('song');
        const voiceChannel = interaction.member.voice.channel;
        const musicChannel = voiceInstance.getMusicChannel();
        if (!voiceChannel) {
            return await interaction.editReply('You need to be in a voice channel to play music!');
        }
        if(!musicChannel){
            return await interaction.editReply('Music channel is not set! set it with /setmusicchannel');
        }
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
            return await interaction.editReply('I need the permissions to join and speak in your voice channel!');
        }
        // let's check if the link is a youtube link or a search, youtube links can be played directly
        // they start with https://www.youtube.com/watch?v= or https://youtu.be/
        // if it's not a youtube link, we will search for it

        let regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (regex.test(songName)) {
            // it's a youtube link, we can play it directly
            let songInfo = await ytdl.getInfo(songName);
            await voiceInstance.joinVoiceChannel(interaction.member.voice.channel.id, interaction.guildId, interaction.guild);
            queueInstance.enqueue({
                title: songInfo.videoDetails.title,
                url: songName,
                thumbnail: songInfo.videoDetails.thumbnails[0].url,
                requester: interaction.user.tag,
                duration: songInfo.videoDetails.lengthSeconds,
                currentlyPlaying: false
            });
            await interaction.editReply({ content: 'Song added to the queue', components: [], ephemeral: true });
        } else {
            //means it's a search query
            let { filtered } = await youtubeSearcherInstance.search(songName);
            await voiceInstance.joinVoiceChannel(interaction.member.voice.channel.id, interaction.guildId, interaction.guild);

            //dropdown
            await interaction.editReply({
                content: 'Select the song you want to play',
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 3,
                                custom_id: 'play',
                                options: filtered,
                                placeholder: 'Select a song',
                            }
                        ]
                    }
                ],
                ephemeral: true,
            })
        }
    },
    async executeMenu(interaction) {
        const lastSearch = await youtubeSearcherInstance.getLatestSearch();
        const selectedSong = lastSearch.items[interaction.values[0]];
        queueInstance.enqueue({
            title: selectedSong.title,
            url: selectedSong.url,
            thumbnail: selectedSong.bestThumbnail.url,
            requester: interaction.user.tag,
            duration: selectedSong.duration,
            currentlyPlaying: false
        });
        await interaction.reply({ content: 'Song added to the queue', components: [], ephemeral: true });
    }
};