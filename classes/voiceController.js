const eventEmitter = require('events');
class voiceController extends eventEmitter {
    constructor(voiceClient) {
        super();
        this.voiceClient = voiceClient;
        this.musicChannel = null;
        this.volume = 1;
    }

    async checkVoiceConnection(guildId) {
        let voiceConnection = await this.voiceClient.getVoiceConnection(guildId);
        if (voiceConnection) {
            return voiceConnection;
        } else {
            return false;
        }
    }

    async joinVoiceChannel(channelId, guildId, guild) {
        if (!channelId || !guildId) throw new Error("No channelId or guildId provided");
        let voiceConnection = await this.checkVoiceConnection(guildId);
        if (voiceConnection) {
            return voiceConnection;
        }
        voiceConnection = await this.voiceClient.joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        })
        return voiceConnection;
    }

    async leaveVoiceChannel(guildId) {
        if (!guildId) throw new Error("No guildId provided");
        let voiceConnection = await this.checkVoiceConnection(guildId);
        if (voiceConnection) {
            voiceConnection.destroy();
            return true;
        }
        return false;
    }

    async createAudioPlayer() {
        if(this.currentAudioPlayer) return this.currentAudioPlayer;
        let audioPlayer = await this.voiceClient.createAudioPlayer();
        this.currentAudioPlayer = audioPlayer;
        return audioPlayer;
    }

    async playSong(stream, guildId) {
        const audioResource = await this.voiceClient.createAudioResource(stream, { inlineVolume: true });
        audioResource.volume.setVolume(this.volume);
        this.currentSong = audioResource;
        const audioPlayer = await this.createAudioPlayer();
        audioPlayer.play(audioResource);
        const voiceConnection = await this.checkVoiceConnection(guildId);
        if (!voiceConnection) throw new Error("No voiceConnection has been found");

        voiceConnection.subscribe(audioPlayer);
        return audioPlayer;
    }

    async getCurrentPlaybackTime() {
        if (!this.currentAudioPlayer) throw new Error("No audioPlayer has been found");
        if(!this.currentSong) return 0;
        return this.currentSong.playbackDuration;
    }

    getMusicChannel() {
        return this.musicChannel;
    }

    setMusicChannel(channel) {
        this.musicChannel = channel;
    }

    playAudio(audioResource, audioPlayer) {
        if (!audioResource || !audioPlayer) throw new Error("No audioResource or audioPlayer provided");
        this.currentAudioPlayer.play(audioResource);
    }

    pauseAudio() {
        if (!this.currentAudioPlayer) throw new Error("No audioPlayer has been found");
        this.currentAudioPlayer.pause();
    }

    resumeAudio() {
        if (!this.currentAudioPlayer) throw new Error("No audioPlayer has been found");
        this.currentAudioPlayer.unpause();
    }

    stopAudio() {
        if (!this.currentAudioPlayer) throw new Error("No audioPlayer has been found");
        this.currentAudioPlayer.stop();
    }

    setVolume(volume) {
        if (!volume || !this.currentSong) throw new Error("No volume or song has been found");
        this.currentSong.volume.setVolume(volume);
        this.emit('volumeChange', volume);
    }

    getVolume() {
        if (!this.currentSong) throw new Error("No song has been found");
        return this.currentSong.volume.volume;
    }

    getAudioPlayer() {
        return this.currentAudioPlayer;
    }

    attachEventListeners(type, callback) {
        if (!type || !callback) throw new Error("No type or callback provided");
        switch (type) {
            case 'playing':
                this.currentAudioPlayer.on(this.voiceClient.AudioPlayerStatus.Playing, callback);
                break;
            case 'idle':
                this.currentAudioPlayer.on(this.voiceClient.AudioPlayerStatus.Idle, callback);
                break;
        }
    }
    destroyEventListeners(type) {
        if (!type || !eventListener) throw new Error("No type or eventListener provided");
        //get listeners
        let listeners = this.currentAudioPlayer.listeners(type);
        switch (type) {
            case 'playing':
                this.currentAudioPlayer.off(this.voiceClient.AudioPlayerStatus.Playing, listeners[0]);
                break;
            case 'idle':
                this.currentAudioPlayer.off(this.voiceClient.AudioPlayerStatus.Idle, listeners[0]);
                break;
        }
        return true;
    }
}
module.exports = voiceController;