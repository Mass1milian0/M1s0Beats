const { ButtonBuilder, ActionRowBuilder } = require('discord.js');


function createButton(options) {
    let button = new ButtonBuilder()
    for (let [optionName, optionValue] of Object.entries(options)) {
        switch (optionName) {
            case "style":
                button.setStyle(optionValue);
                break;
            case "label":
                button.setLabel(optionValue);
                break;
            case "emoji":
                button.setEmoji(optionValue);
                break;
            case "custom_id":
                button.setCustomId(optionValue);
                break;
            case "url":
                button.setURL(optionValue);
                break;
            case "disabled":
                button.setDisabled(optionValue);
                break;
            default:
                throw new Error("Invalid button option provided");
        }
    }
    return button;
}

function createButtonRow(buttons) {
    let buttonRow = new ActionRowBuilder();
    buttonRow.addComponents(buttons);
    return buttonRow;
}


module.exports = {createButton, createButtonRow};