const Discord = require('discord.js');

const client = new Discord.Client();

const token = 'Njk2MDg5NTc1MjczMTM2MTM4.XpnHlg.T1-PqGdpn7hNCvM4s9XUnlOVRxM';

const initiateDiscordService = () => {
    client.once('ready', () => {
        console.log('Discord service initiated.');
    });

    client.login(token);
}

function getClient() {
    return client;
}

module.exports = {
    initiateDiscordService: initiateDiscordService,
    getClient: getClient
}
