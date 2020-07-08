module.exports = {
  name: 'prune',
  description: 'Bulk delete messages',
  execute(message, args) {
    // Add 1 because the command counts as a message
    const amount = parseInt(args[0]) + 1;

    if (isNaN(amount)) {
      return message.reply('that doesn\' seem to be a valid number.');
    } else if (amount <= 1 || amount > 100) {
      return message.reply('you need to input a number between 2 and 100.');
    }

    console.log(amount);

    message.channel.bulkDelete(amount, true).catch(err => {
      console.error(err);
      message.channel.send('there was an error trying to prune messages in this channel!');
    });
  }
}
