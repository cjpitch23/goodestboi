// Configuration import
const { prefix, token } = require('./config.json');

// Require Discord and Client
const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

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

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.cache.find(ch => ch.name === 'member-log');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}`);
});

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
