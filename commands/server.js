module.exports = {
  name: 'server',
  short: 'Server Info',
  description: 'This shows server name, and the total members in the server.',
  execute(message, args) {
    message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
  }
}
