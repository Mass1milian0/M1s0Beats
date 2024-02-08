const ytsr = require('ytsr');
class youtubeSearcher {
    constructor() {
    }

    async search(query) {
        const searchResults = await ytsr(query, { limit: 6 });
        let filtered = searchResults.items.map((item, index) => {
            if (item.type !== 'video') return;
            return {
                label: item.title,
                description: item.author.name,
                value: "" + index,
            }
        });
        filtered = filtered.filter(element => element !== undefined);
        this.lastSearch = searchResults;
        return {searchResults, filtered};
    }

    async getLatestSearch() {
        return this.lastSearch;
    }
}
module.exports = youtubeSearcher;