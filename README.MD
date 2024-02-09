# M1S0Beats
This is a Discord bot project that provides various functionalities such as playing songs, managing a song queue, and interacting with users through buttons and menus.

## Features

- Play a song: Use the `/play` command followed by the name of the song you want to play.
- Pause and resume: Use the `/pause` and `/resume` commands to control song playback.
- Manage the song queue: Use the `/queue` command to view the current song queue.
- Volume control: Use the `/volumeup` or `/volumedown` command to increase or decrease the volume by 10%.
- Disconnect: Use the `/disconnect` command to disconnect the bot from the voice channel.

## Setup

1. Clone the repository.
2. Run `npm install` to install the necessary dependencies.
3. Create a `.env` file and add your Discord bot token, client ID, and guild ID.
4. ```
    TOKEN=your_discord_bot_token
    CLIENT_ID=your_discord_client_id
    GUILD_ID=your_discord_guild_id
    ```
5. Run `node index.js` to start the bot.

## Dependencies

This project uses the following dependencies:

- discord.js
- @discordjs/voice
- @discordjs/opus
- dotenv
- ffmpeg
- sodium-native
- ytdl-core
- ytsr

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

This project is licensed under the ISC license.