class Boombox {
    constructor(discordjs, client, discordjsVoice, ytdl) {
        this.discordjs = discordjs;
        this.client = client;
        this.discordjsVoice = discordjsVoice;
        this.queue = [];
        this.ytdl = ytdl;
        this.resultHolder;
        this.isConnected = false;
        this.volume = 1;
        this.musicChannel;
        this.embeedMsg;
        this.currentlyPlayingSong;
        this.currentSongInfo;
        this.audioPlayer;
        this.voiceChannelId;
    }
    // given a interaction, enter the user's voice channel
    joinVoiceChannel(interaction) {
        return new Promise((resolve, reject) => {
            //check if the user is in a voice channel
            const voiceChannel = interaction.member.voice.channel;
            this.voiceChannelId = voiceChannel.id;
            if (!voiceChannel) {
                return reject(interaction.editReply('You need to be in a voice channel to play music!'));
            }
            //check if the bot has permission to join the voice channel
            const permissions = voiceChannel.permissionsFor(interaction.client.user);
            let permissionBitFiels = this.discordjs.PermissionsBitField.Flags
            if (!permissions.has(permissionBitFiels.Connect) || !permissions.has(permissionBitFiels.Speak)) {
                return reject(interaction.editReply('I need the permissions to join and speak in your voice channel!'));
            }
            //if not connected to a voice channel, connect to it
            if (!interaction.guild.members.me.voice.channel || this.discordjsVoice.getVoiceConnection(interaction.guild.id) === null) {
                this.discordjsVoice.joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                    selfDeaf: true,
                    selfMute: false,
                });
                resolve();
            } else {
                resolve();
            }
        });
    }

    joinGuildVoiceChannel(guildId) {
        return new Promise((resolve, reject) => {
            this.discordjsVoice.joinVoiceChannel({
                channelId: this.voiceChannelId,
                guildId: guildId,
                adapterCreator: this.client.guilds.cache.get(guildId).voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false,
            });
            resolve();
        });
    }

    async playQueue() {
        //in the queue, find the element with currentlyPlaying = true if any
        const currentlyPlaying = this.queue.find(element => element.currentlyPlaying === true);
        if (!currentlyPlaying) {
            //if there is no element with currentlyPlaying = true, set the first element to currentlyPlaying = true
            this.queue[0].currentlyPlaying = true;
            //play the song
            this.playSong(this.queue[0]);
        }
    }

    async playSong(song, startTime = 0) {
        //get the voice connection
        const voiceConnection = this.discordjsVoice.getVoiceConnection(song.guildid);
        //get the music channel
        if (!this.musicChannel) {
            //fuzzy search of general channel or bot channel and send a warning message there
            //imporant that it is a fuzzy search because the channel name can be different
            const generalChannel = this.client.channels.cache.find(channel => channel.name === 'general');
            const botChannel = this.client.channels.cache.find(channel => channel.name === 'bot');
            if (generalChannel) {
                generalChannel.send('Please set a music channel with /setmusicchannel');
                return;
            } else if (botChannel) {
                botChannel.send('Please set a music channel with /setmusicchannel');
                return;
            } else {
                console.log('Please set a music channel with /setmusicchannel');
                return;
            }
        }
        const musicChannel = this.client.channels.cache.get(this.musicChannel.id);
        //send a message with the song title and the requester
        if (this.embeedMsg) {
            this.updateEmbeed(song);
        } else {
            try {
                let { embeed, rows } = this.embeedController(song);
                let embeedMsg = await musicChannel.send({ embeds: [embeed], components: rows, fetchReply: true });
                this.embeedMsg = embeedMsg;
            } catch (error) {
                //embeedMsg isn't null but can't be fetched anymore
                this.embeedMsg = null;
                this.playSong(song);
            }
        }
        this.currentSongInfo = song;
        //get the song stream highest quality
        try {
            if (startTime > 0) {
                startTime = startTime / 1000;
                song.url = song.url + `&t=${startTime}`;
            }
            const stream = this.ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 30,
                liveBuffer: 40000
            });
            //enable the volume control
            const audioResource = this.discordjsVoice.createAudioResource(stream, { inlineVolume: true });
            this.currentlyPlayingSong = audioResource;
            //play the song
            const audioPlayer = this.discordjsVoice.createAudioPlayer();
            //play the audio resource
            audioPlayer.play(audioResource);
            this.audioPlayer = audioPlayer;
            //now subscribe the audio player to the voice connection
            try {
                voiceConnection.subscribe(audioPlayer);
            } catch (error) {
                //if subscribe fails, reset everything and try to connect again to the voice channel
                this.audioPlayer = null;
                this.currentlyPlayingSong = null;
                this.embeedMsg = null;
                try {
                    voiceConnection.destroy();
                } catch (error) {
                    console.log(error);
                }
                joinGuildVoiceChannel(song.guildid);
                this.playQueue();
            }
            //when the song ends
            let interval
            audioPlayer.on(this.discordjsVoice.AudioPlayerStatus.Playing, () => {
                //while the song is playing, update the embeed with the current time
                interval = setInterval(() => {
                    if (!this.currentlyPlayingSong) return;
                    this.updateEmbeed(this.currentSongInfo);
                }, 5000);
            });
            audioPlayer.on(this.discordjsVoice.AudioPlayerStatus.Idle, () => {
                this.updateEmbeed(this.currentSongInfo);
                //remove the song from the queue
                this.queue.shift();
                //set the next song in the queue to currentlyPlaying = true
                if (this.queue.length) {
                    this.queue[0].currentlyPlaying = true;
                    //play the next song
                    this.playSong(this.queue[0]);
                } else {
                    //if there are no more songs in the queue, set the currentlyPlayingSong to null
                    this.currentlyPlayingSong = null;
                }
                clearInterval(interval);
            });
        } catch (error) {
            //if there is an error, log it
            console.log(error);
            //and try to resume the song at the this.currentlyPlayingSong.playbackDuration time

            this.playSong(song, this.currentlyPlayingSong.playbackDuration);
        }
    }

    embeedController(songInfo) {
        //returns the embeed controller which shows:
        //thumbnail of the song
        //name of the song
        //requester
        //buttons to skip, pause, resume, stop
        //buttons to change the volume
        let songDuration = songInfo.duration;
        //if the song was searched by name, the duration is in this format: 00:00 no need to convert it
        let songCurrentTime;
        if (!this.currentlyPlayingSong) { songCurrentTime = 0; }
        else { songCurrentTime = this.currentlyPlayingSong.playbackDuration; }
        //playbackDuration is in milliseconds
        //convert it to seconds
        songCurrentTime = songCurrentTime / 1000;
        //convert it to minutes and seconds
        let songCurrentTimeMinutes = Math.floor(songCurrentTime / 60);
        let songCurrentTimeSeconds = Math.floor(songCurrentTime % 60);
        //if songDuration is in the format 00:00 or 0:00 or 0:0, don't convert it
        let regex = new RegExp('^([0-9]{1,2}:){1,2}[0-9]{1,2}$');
        let songDurationMinutes
        let songDurationSeconds
        if (!regex.test(songDuration)) {
            songDurationMinutes = Math.floor(songDuration / 60);
            songDurationSeconds = Math.floor(songDuration % 60);
        } else {
            songDurationMinutes = songDuration.split(':')[0];
            songDurationSeconds = songDuration.split(':')[1];
        }
        //convert it to a string
        let finalSongCurrentTime = `${songCurrentTimeMinutes}:${songCurrentTimeSeconds} / ${songDurationMinutes}:${songDurationSeconds}`;
        const embeed = new this.discordjs.EmbedBuilder()
        embeed.setColor('#0099ff')
        embeed.setTitle(songInfo.title)
        embeed.setThumbnail(songInfo.thumbnail)
        embeed.addFields([
            { name: 'Requester', value: songInfo.requester, inline: false },
            { name: 'Volume', value: `Currently: ${Math.round(this.volume * 100)}%`, inline: false },
            { name: 'Current Time', value: finalSongCurrentTime, inline: false },
        ])
        embeed.setTimestamp();
        //buttons
        const skipButton = new this.discordjs.ButtonBuilder().
            setCustomId('skip').
            setStyle('Primary').
            setEmoji('⏭️');

        const pauseButton = new this.discordjs.ButtonBuilder().
            setCustomId('pause').
            setStyle('Primary').
            setEmoji('⏸️');

        const resumeButton = new this.discordjs.ButtonBuilder().
            setCustomId('resume').
            setStyle('Primary').
            setEmoji('▶️');

        const stopButton = new this.discordjs.ButtonBuilder().
            setCustomId('stop').
            setStyle('Primary').
            setEmoji('⏹️');

        const volumeUpButton = new this.discordjs.ButtonBuilder().
            setCustomId('volumeup').
            setStyle('Primary').
            setLabel('⬆️').
            setEmoji('🔊');

        const volumeDownButton = new this.discordjs.ButtonBuilder().
            setCustomId('volumedown').
            setStyle('Primary').
            setLabel('⬇️').
            setEmoji('🔊');

        const queueButton = new this.discordjs.ButtonBuilder().
            setCustomId('queue').
            setStyle('Primary').
            setEmoji('📜');

        const row1 = new this.discordjs.ActionRowBuilder().
            addComponents(skipButton, pauseButton, resumeButton, stopButton);

        const row2 = new this.discordjs.ActionRowBuilder().
            addComponents(volumeDownButton, volumeUpButton, queueButton);

        const rows = [row1, row2];

        return { embeed, rows };

    }

    updateEmbeed(newInfo) {
        //update the embeed with the new info
        let { embeed, rows } = this.embeedController(newInfo);
        this.embeedMsg.edit({ embeds: [embeed], components: rows });
    }

    getMusicChannel() {
        return this.musicChannel;
    }

    setMusicChannel(channel) {
        this.musicChannel = channel;
    }

    updateQueue(queue) {
        this.queue = queue;
    }

    increaseVolume() {
        if (!this.audioPlayer) return;
        if (this.volume >= 1) return;
        this.volume += 0.1;
        this.setVolume(this.volume);
    }

    decreaseVolume() {
        if (!this.audioPlayer) return;
        if (this.volume <= 0) return;
        this.volume -= 0.1;
        this.setVolume(this.volume);
    }

    setVolume(volume) {
        if (!this.audioPlayer) return;
        this.currentlyPlayingSong.volume.setVolume(volume);
        this.updateEmbeed(this.currentSongInfo);
    }

    skipSong() {
        this.audioPlayer.stop();
        this.queue.shift();
        if (this.queue.length) {
            this.playQueue();
        }
    }

    pauseSong() {
        if (!this.audioPlayer) return;
        //if the song is already paused, return
        if (this.audioPlayer.state.status === this.discordjsVoice.AudioPlayerStatus.Paused) return;
        this.audioPlayer.pause();
    }

    resumeSong() {
        if (!this.audioPlayer) return;
        //if the song is already playing, return
        if (this.audioPlayer.state.status === this.discordjsVoice.AudioPlayerStatus.Playing) return;
        this.audioPlayer.unpause();
    }

    stopSong() {
        if (!this.audioPlayer) return;
        this.audioPlayer.stop();
        this.queue = [];
        try {
            this.embeedMsg.delete();
        } catch (error) {
            this.embeedMsg = null;
        }
        //disconnect from the voice channel
        const voiceConnection = this.discordjsVoice.getVoiceConnection(this.currentSongInfo.guildid);
        voiceConnection.destroy();
    }

    getQueueEmbed() {
        //returns the embeed controller which shows:
        //thumbnail of the song
        //name of the song
        //requester
        let queue = this.queue;
        //make several embeeds
        let embeeds = [];
        for (let song of queue) {
            let embeed = new this.discordjs.EmbedBuilder()
            embeed.setColor('#0099ff')
            embeed.setTitle(song.title)
            embeed.setThumbnail(song.thumbnail)
            embeed.addFields([
                { name: 'Position', value: `Position: ${queue.indexOf(song) + 1}`, inline: false },
                { name: 'Requester', value: song.requester, inline: false }
            ])
            embeed.setTimestamp();
            embeeds.push(embeed);

        }
        return embeeds;
    }

    setResultHolder(resultHolder) {
        this.resultHolder = resultHolder;
    }

    getResultHolder() {
        return this.resultHolder;
    }
}
module.exports = Boombox;