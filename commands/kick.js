module.exports = {
  name: 'kick',
  description: 'Kick user',
  guildOnly: true,
  execute(message, args) {
    // Check for user mention
    if (!message.mentions.users.size) {
      // NO mention, return
      // .reply will prepend a mention of the person who sent the message
      return message.reply('you need to tag a user in order to kick them!');
    }

    // grab the "first" mentioned user from the message
    // this will return a `User` object, just like `message.author`
    const taggedUser = message.mentions.users.first();

    if (taggedUser.id === '730421537223737455') {
      message.channel.send('Ow! My feelings! :cry:');
      return;
    } else if (taggedUser.id === '325296934539624452') {
      message.channel.send('No, I won\'t kick my master, I\'m the goodest boi. :dog:');
      return;
    }

    message.channel.send(`You wanted to kick: ${taggedUser.username}`);
  }
}
