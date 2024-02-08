require('dotenv').config();
const { Collection, Events } = require('discord.js');
require("./register.js")
const fs = require('fs');
const path = require('path');
const queueInstance = require('./services/queueInstance.js');
const embeedCreator = require('./classes/embeedCreator.js');
const buttonCreator = require('./classes/buttonCreator.js');
const { discordInstance, client } = require('./services/discordInstance.js');
const ytdl = require('ytdl-core');
const voiceInstance = require('./services/voiceInstance.js');
async function main() {
    let embeedMessage;
    let skipButton = buttonCreator.createButton({
        style: "Primary",
        custom_id: "skip",
        emoji: "⏭️"
    });
    let pauseButton = buttonCreator.createButton({
        style: "Primary",
        custom_id: "pause",
        emoji: "⏸️"
    });
    let resumeButton = buttonCreator.createButton({
        style: "Primary",
        custom_id: "resume",
        emoji: "▶️"
    });
    let stopButton = buttonCreator.createButton({
        style: "Primary",
        custom_id: "stop",
        emoji: "⏹️"
    });
    let volumeUpButton = buttonCreator.createButton({
        label: "⬆️",
        style: "Primary",
        custom_id: "volumeup",
        emoji: "🔊"
    });
    let volumeDownButton = buttonCreator.createButton({
        label: "⬇️",
        style: "Primary",
        custom_id: "volumedown",
        emoji: "🔉"
    });
    let queueButton = buttonCreator.createButton({
        style: "Primary",
        custom_id: "queue",
        emoji: "📜"
    });
    let disconnectButton = buttonCreator.createButton({
        style: "Primary",
        custom_id: "disconnect",
        emoji: "🔴"
    });
    const row1 = buttonCreator.createButtonRow([skipButton, pauseButton, resumeButton, stopButton]);
    const row2 = buttonCreator.createButtonRow([volumeUpButton, volumeDownButton, queueButton, disconnectButton]);
    const buttonRows = [row1, row2]; //common buttons
    let audioplayer = await voiceInstance.createAudioPlayer();
    let interval;
    client.commands = new Collection();

    process.on('uncaughtException', function (err) {
        console.error(err);
    });

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    client.on(Events.InteractionCreate, async interaction => {
        //if interaction is a menu
        if (interaction.isStringSelectMenu()) {
            let id = interaction.customId;
            let command = interaction.client.commands.get(id);
            try {
                command.executeMenu(interaction);
            } catch (error) {
                console.error(error);
                try {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                } catch (error) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return;
        }
        //if interaction is a button
        else if (interaction.isButton()) {
            let id = interaction.customId;
            let command = interaction.client.commands.get(id);
            try {
                command.execute(interaction);
            } catch (error) {
                console.error(error);
                try {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                } catch (error) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
            return;
        }
        else {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                try {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                } catch (error) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    });

    function formatDuration(currentTime, duration) {
        currentTime = currentTime / 1000;

        let currentTimeMinutes = Math.floor(currentTime / 60);
        let currentTimeSeconds = Math.floor(currentTime % 60);

        //if songDuration is in the format 00:00 or 0:00 or 0:0, don't convert it
        let regex = new RegExp('^([0-9]{1,2}:){1,2}[0-9]{1,2}$');

        let songDurationMinutes
        let songDurationSeconds

        if (regex.test(duration)) {
            let split = duration.split(':');
            songDurationMinutes = parseInt(split[0]);
            songDurationSeconds = parseInt(split[1]);
        } else {
            songDurationMinutes = Math.floor(duration / 60);
            songDurationSeconds = Math.floor(duration % 60);
        }
        return `${currentTimeMinutes}:${currentTimeSeconds}/${songDurationMinutes}:${songDurationSeconds}`;
    }

    async function playSong(song) {
        //play the song
        let stream = ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 30,
            liveBuffer: 40000
        });
        let audioplayer = await voiceInstance.playSong(stream, process.env.GUILDID);
        let volume = voiceInstance.getVolume();
        volume = `Currently: ${Math.round(volume * 100)}%`;
        let currentTime = 0;
        //create the embeed if it doesn't exist
        if (!embeedMessage) {
            let embeed = await embeedCreator({
                title: song.title,
                color: '#0099ff',
                thumbnail: song.thumbnail,
                fields: [
                    { name: "Requested by", value: song.requester },
                    { name: "Volume", value: volume },
                    { name: "Current Time", value: formatDuration(currentTime, song.duration) }
                ]
            });
            const musicChannel = voiceInstance.getMusicChannel();
            embeedMessage = await discordInstance.sendEmbed(embeed, buttonRows, musicChannel)
        }
        return audioplayer;
    }

    async function updateEmbeedInterval(song, foredLastUpdate = false, durationOverride = 0) {
        if (foredLastUpdate) {
            //send the last update to the embeed
            let volume = voiceInstance.getVolume();
            volume = `Currently: ${Math.round(volume * 100)}%`;
            let newEmbeed = await embeedCreator({
                title: song.title,
                color: '#0099ff',
                thumbnail: song.thumbnail,
                fields: [
                    { name: "Requested by", value: song.requester },
                    { name: "Volume", value: volume },
                    { name: "Current Time", value: formatDuration(song.duration, song.duration) }
                ]
            });
            embeedMessage.edit({ embeds: [newEmbeed], components: buttonRows });
            return;
        }
        interval = setInterval(async () => {
            let currentTime = await voiceInstance.getCurrentPlaybackTime();
            if(durationOverride>0){
                currentTime = durationOverride;
            }
            let volume = voiceInstance.getVolume();
            volume = `Currently: ${Math.round(volume * 100)}%`;
            let newEmbeed = await embeedCreator({
                title: song.title,
                color: '#0099ff',
                thumbnail: song.thumbnail,
                fields: [
                    { name: "Requested by", value: song.requester },
                    { name: "Volume", value: volume },
                    { name: "Current Time", value: formatDuration(currentTime, song.duration) }
                ]
            });
            embeedMessage.edit({ embeds: [newEmbeed], components: buttonRows });
        }, 1000);
        return interval;
    }
    voiceInstance.attachEventListeners("idle", async () => {
        if (interval) clearInterval(interval);
        if (!queueInstance.isEmpty()) {
            queueInstance.dequeue();
            song = queueInstance.peek();
            playSong(song);
            updateEmbeedInterval(song, true, 1);
            updateEmbeedInterval(song);
        }
    });

    queueInstance.on('queueElementAdded', async (queue) => {
        //check if the queue is empty
        if (queue.length === 1) {
            //if it's empty, play the song
            let song = queue[0];
            playSong(song);
            //update the embeed every 5 seconds while the song is playing
            interval = await updateEmbeedInterval(song);
        }
    });

    queueInstance.on('queueSkip', async (queue) => {
        //check if the queue is empty
        let skippedSong = queue[0];
        queueInstance.dequeue();
        if (queue.length === 0) {
            //if it's empty simply do nothing
            if (interval) clearInterval(interval);
        } else {
            interval = clearInterval(interval);
            song = queueInstance.peek();
            playSong(song);
            updateEmbeedInterval(song, true, 1);
            interval = await updateEmbeedInterval(song);
        }
    });

    queueInstance.on('queueDisconnect', async () => {
        if (interval) clearInterval(interval);
        embeedMessage.delete();
        embeedMessage = null;
    });

    voiceInstance.on('volumeChange', async (volume) => {
        if(!embeedMessage) return;
        if(queueInstance.isEmpty()) return;
        let song = queueInstance.peek();
        let currentTime = await voiceInstance.getCurrentPlaybackTime();
        let newEmbeed = await embeedCreator({
            title: song.title,
            color: '#0099ff',
            thumbnail: song.thumbnail,
            fields: [
                { name: "Requested by", value: song.requester },
                { name: "Volume", value: `Currently: ${Math.round(volume * 100)}%` },
                { name: "Current Time", value: formatDuration(currentTime, song.duration) }
            ]
        });
        embeedMessage.edit({ embeds: [newEmbeed], components: buttonRows });
    });
}

main();