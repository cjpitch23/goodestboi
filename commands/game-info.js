const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
  name: 'game-info',
  alias: 'game',
  short: 'Get game information.',
  description: 'Will reach out to another API to pull data on the specified game and specified platform.',
  args: true,
  usage: '[ps4, xbox1, pc, switch] [game name]',
  async execute(message, args) {
    // Common System Alias
    let platform = args.shift().toLowerCase();
    const game = args.join(' ');

    let gameMsg = 'There was an issue';

    if (platform === 'ps4') {
      platform = 'playstation-4';
    } else if (platform === 'xbox1') {
      platform = 'xbox-one';
    }

    await axios({
      'method':'GET',
      'url':`https://chicken-coop.p.rapidapi.com/games/${game}`,
      'headers':{
        'content-type':'application/octet-stream',
        'x-rapidapi-host':'chicken-coop.p.rapidapi.com',
        'x-rapidapi-key':'8f022d9470msh9059222fa947462p17851djsn16e34af04d09',
        'useQueryString':true
      },'params':{
        platform
      }
    }).then((r)=>{
      if (r.data.result === 'No result') {
        gameMsg = `No results. Are you sure ${game} is the proper spelling?\nThere's also a chance that ${platform} is incorrect.`;
      } else {
        gameMsg = new Discord.MessageEmbed()
        .setColor('#e69c56')
        .setAuthor('Goodest Boi')
        .setTitle(r.data.result.title)
        .setDescription(r.data.result.description)
        .addFields(
          { name: 'Developer', value: r.data.result.developer, inline: true },
          { name: 'Score', value: r.data.result.score, inline: true }
        )
        .addFields(
          {
            name: 'Available On',
            value: (r.data.result.alsoAvailableOn) ? r.data.result.alsoAvailableOn.join(', ') : null
          },
          {
            name: 'Genre',
            value: (r.data.result.genre) ? r.data.result.genre.join(', ') : null
          }
        )
        .setThumbnail(r.data.result.image)
        .setTimestamp()
        .setFooter('Chicken-Coop API')
      }
    }).catch((error)=>{
      console.log(error.response);
      return message.reply('There was an error. I\'ll let my master know. :open_mouth:');
    })
    message.channel.send(gameMsg);
  }
}