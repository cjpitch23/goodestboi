module.exports = {
  name: 'reload',
  description: 'Reloads a command',
  execute(message, args) {
    // Get command name from arguments
    const commandName = args[0].toLowerCase();

    // Find command by name or alias
    const command = message.client.commands.get(commandName)
      || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If no command is found, return message
    if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

    // Remove command file from cache
    delete require.cache[require.resolve(`./${command.name}.js`)];


    try {
      // Require command
      const newCommand = require(`./${command.name}.js`);

      // Add command to client
      message.client.commands.set(newCommand.name, newCommand);

      // Send success message
      message.channel.send(`Command \`${command.name}\` was reloaded!`);
    } catch (err) {
      // Log Err
      console.log(err);

      // Send message with err information
      message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${err.message}\``);
    }
  }
}
