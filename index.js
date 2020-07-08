// Configuration import
const { prefix, token } = require('./config.json');

// Require Discord and Client
const Discord = require('discord.js');
const client = new Discord.Client();

// When Client is Ready, Run this Code
// Only triggered once on log in
client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  if (message.content === `${prefix}ping`) {
    message.channel.send('Pong.');
  }
});

// Login to discord with bots token
client.login(token);
