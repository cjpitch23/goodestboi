const { prefix } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
  name: 'help',
  short: 'List of commands.',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 5,
  execute(message, args) {
    const helpEmbed = new Discord.MessageEmbed()
      .setColor('#e69c56')
      .setAuthor('Goodest Boi')
      .setTimestamp()

    const { commands } = message.client;

    if (!args.length) {
      // Commands to be shown
      const visibleCommands = commands.filter(c => !['reload', 'args-info', 'avatar'].includes(c.name));
      helpEmbed.setTitle('Help - Commands')
        .setDescription('Here are a list of commands that I am capable of carrying out.')
        .addFields(
          visibleCommands.map((c) => {
            return {
              name: `${prefix}${c.name}`,
              value: c.short,
              inline: true,
            }
          })
        )
        .addField('Furthermore', `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`)

      return message.author.send(helpEmbed)
        .then(() => {
          if (message.channel.type === 'dm') return;
          message.reply('I\'ve sent you a DM with all my commands!');
        }).catch((err) => {
          console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
          message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
        })
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name || commands.find(c => c.aliases && c.aliases.includes(name)));

    if (!command) {
      return message.reply('that\'s not a valid command!');
    }

    const fieldList = [];

    if (command.aliases) fieldList.push({ name: 'Aliases', value: command.aliases.join(', '), inline: true });
    if (command.usage) fieldList.push({ name: 'Usage', value: `${prefix}${command.name} ${command.usage}`, inline: true });
    fieldList.push({ name: 'Cooldown', value: `${command.cooldown || 3} second(s)` });

    helpEmbed.setTitle(`Help - ${command.name}`)
      .setDescription(command.description)
      .addFields(
        fieldList.map(f => f),
      )

    message.channel.send(helpEmbed);
  }
}

