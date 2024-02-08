class DiscordInstance {
    constructor(discordClient) {
        this.discordClient = discordClient;
    }

    async sendEmbed(embed, components, channel) {
        let embeedMsg = await channel.send({ embeds : [embed], components: components, fetchReply: true});
        return embeedMsg;
    }
    
}
module.exports = DiscordInstance;