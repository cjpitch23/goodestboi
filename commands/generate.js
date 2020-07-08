module.exports = {
  name: 'generate',
  short: 'Randomly generate team',
  description: 'Randomly generates a team based on a team capacity and a list of players.',
  aliases: ['team'],
  usage: '[capacity:int] [players]',
  args: true,
  execute(message, args) {
    const capacity = args.shift(); // Get capacity
    const players = args; // List of players

    // Make sure Capacity is a number
    if (isNaN(capacity)) {
      return message.reply('team capacity doesn\'t seem to be a valid number.');
    }

    // Check number of players
    if (players.length === 1) {
      // Only one player
      return message.channel.send(`${players[0]} is all alone. Don't worry! I'll be their friend!`);

    } else if (players.length > 6) {
      // Too many players listed
      return message.channel.send('Whoa. I\'m the goodest boi, but I can\'t do that type of math. \n Please only name 6 players at maximum.')

    } else if (players.length <= capacity) {
      // Enough players for 1 team
      const msg = [`**Team 1:**`];
      players.forEach((p) => {
        console.log(p);
        msg.push(` ${p}`);
      })
      return message.channel.send(msg.join(''));
    }

    // Number of Teams to be Generated (Rounded up)
    const numOfTeams = Math.round(players.length / capacity);
    const teams = [];

    let i = 1; // Initial Value of I for while
    while (i <= numOfTeams) {
      // Create the Team
      const team = [`**Team ${i}:**`];

      // Check players length
      if (players.length === 1) {
        // If 1 player, push player to team
        team.push(players[0]);
      } else {
        // Loop over array until there are no players or the team is filled
        for (p = 0; p < capacity && p <= players.length; p++) {
          // Generate a random number
          const randomNumber = Math.floor(Math.random() * players.length);

          // Push random player to team
          team.push(` ${players[randomNumber]}`);

          // Remove player from players list
          players.splice(randomNumber, 1);
        };
      }

      // Push the team to the teams array
      teams.push(team.join(''));

      // Increment loop
      i++
    }

    message.channel.send(teams);
  }
}
