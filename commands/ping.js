module.exports = {
  name: 'ping',
  short: 'Ping Bot',
  description: 'Ping!',
  cooldown: 5, //  command cooldown in seconds
  execute(message, args) {
    message.channel.send('Pong');
  }
}
