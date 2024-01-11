require('dotenv').config();
const { Collection, Events} = require('discord.js');
require("./register.js")
const fs = require('fs');
const path = require('path');
const queueManager = require('./services/queueManager');
const {boomBoxManager,client} = require('./services/boomBoxManager');

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

queueManager.on('updated', (queue) => {
    boomBoxManager.updateQueue(queue);
});