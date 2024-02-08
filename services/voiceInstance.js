const discordVoice = require('@discordjs/voice');
const voiceController = require('../classes/voiceController.js');
const voiceInstance = new voiceController(discordVoice);

module.exports = voiceInstance;