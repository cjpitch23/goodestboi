module.exports = {
  name: 'user-info',
  short: 'User Information',
  description: 'The requesters username and their userid.',
  execute(message) {
    message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
  }
}
