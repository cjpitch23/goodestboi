// Configuration import
const { prefix, token } = require('./config.json');

// Require Discord and Client
const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');

const client = new Discord.Client();
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // Set a new item in the collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

// When Client is Ready, Run this Code
// Only triggered once on log in
client.once('ready', () => {
  console.log('Ready!');
});

/**
  * GUILD MEMBER ADD
  * =====================================================
  *
  *  @desc Create an event listener for new guild members
 */
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const greetChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome-mat');
  const adminChannel = member.guild.channels.cache.find(ch => ch.name === 'bot-logs');

  // Do nothing if the channel wasn't found on this server
  if (!greetChannel) return;

  // Send the message, mentioning the member
  greetChannel.send(`Welcome to the server, ${member}`);

  // Send log to admin channel
  if (adminChannel) {
    adminChannel.send(`${member}, joined the server. ${moment().format('MMM Do YYYY [@] h:mm a')}`);
  }
});

/**
  * GUILD MEMBER UPDATE
  * =====================================================
  *
  *  @desc Create an event listener for when a guild member is updated
  *  ! Commented Out because it was sending excessive amounts of messages
 */
// client.on('guildMemberUpdate', (oldMember, newMember) => {
//   // Get channel to send log
//   const adminChannel = oldMember.guild.channels.cache.find(ch => ch.name === 'bot-logs');
//   let returnMsg = `Guild Member Updated ${oldMember.displayName}`;

//   // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
//   const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

//   if (removedRoles.size > 0) returnMsg = (`The role <@&${removedRoles.map(r => r.id)}> was removed from <@${oldMember.id}>.`);

//   // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
//   const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
//   if (addedRoles.size > 0) returnMsg = (`The role <@&${addedRoles.map(r => r.id)}> was added to <@${oldMember.id}>.`);

//   // Send log
//   adminChannel.send(`${returnMsg}\n${moment().format('MMM Do YYYY [@] h:mm a')}`);
// });

/**
  * BOT COMMAND
  * =====================================================
  *
  *  @desc Executed whenever a user calls an action from the bot
 */
client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now(); // Current Timestamp
  const timestamps = cooldowns.get(command.name); // Gets the Collection for the triggered command

  // Gets cooldown ammount and converts it from secs to millisecs (default 3 seconds)
  const cooldownAmount = (command.cooldown || 3) * 1000;

  // Check timestamps Collection for Author
  if (timestamps.has(message.author.id)) {
    // Add time of command to cooldown for expiration time
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    // Check current time against expiration time
    if (now < expirationTime) {
      // Calculate difference between expiration and current name and convert to seconds
      const timeLeft = (expirationTime - now) / 1000;

      // Send Reply
      return message.reply(
        `
          please wait ${timeLeft.toFixed(1)} more
          ${(timeLeft.toFixed(1) > 1) ? 'seconds' : 'second'}
          before reusing the \`${command.name}\` command.
        `
      );
    }
  }

  // Add author oto timestamps collections
  timestamps.set(message.author.id, now);

  // Start timer to delete author from timestamps after cooldown
  setTimeout(() => { timestamps.delete(message.author.id), cooldownAmount });

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

// Login to discord with bots token
client.login(token);
