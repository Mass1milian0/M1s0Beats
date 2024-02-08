const {EmbedBuilder} = require('discord.js');
async function createEmbed(embeedOptions){
    let embeed = new EmbedBuilder();
    for (let [optionName, optionValue] of Object.entries(embeedOptions)) {
        switch (optionName){
            case "title":
                embeed.setTitle(optionValue);
                break;
            case "description":
                embeed.setDescription(optionValue);
                break;
            case "url":
                embeed.setURL(optionValue);
                break;
            case "color":
                embeed.setColor(optionValue);
                break;
            case "timestamp":
                embeed.setTimestamp(optionValue);
                break;
            case "thumbnail":
                embeed.setThumbnail(optionValue);
                break;
            case "image":
                embeed.setImage(optionValue);
                break;
            case "author":
                embeed.setAuthor(optionValue);
                break;
            case "fields":
                embeed.addFields(optionValue);
                break;
            case "footer":
                embeed.setFooter(optionValue);
                break;
            default:
                throw new Error("Invalid embeed option provided");
        }
    }
    return embeed;
}
module.exports = createEmbed;