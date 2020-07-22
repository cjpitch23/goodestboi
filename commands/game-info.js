const axios = require('axios');
const Discord = require('discord.js');
const { rapidApiKey } = require('../config.json');

module.exports = {
  name: 'game-info',
  alias: 'game',
  short: 'Get game information.',
  description: 'Will reach out to another API to pull data on the specified game and specified platform.',
  args: true,
  usage: '[ps4, xbox1, pc, switch] [game name]',
  async execute(message, args) {
    // Initialize Variables
    let platform = args.shift().toLowerCase();
    const game = args.join(' ');

    // Default Message
    let gameMsg = 'There was an issue';

    // Check platform and reset specific keywords ['ps4', 'xbox1']
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
        'x-rapidapi-key':rapidApiKey,
        'useQueryString':true
      },'params':{
        platform
      }
    }).then(async (r) => {
      // See if there are results
      if (r.data.result === 'No result') {
        await axios({
            "method":"GET",
            "url":"https://chicken-coop.p.rapidapi.com/games",
            "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"chicken-coop.p.rapidapi.com",
            "x-rapidapi-key":rapidApiKey,
            "useQueryString":true
          },"params":{
            "title": game
          }
        }).then((r) => {
          const gameList = r.data.result;
          gameMsgArr = [`No results were found for ${game} on ${platform}. Here are some possible matches for you try again.`]
          gameList.map((game, i) => {
            if (i === 0) {
              gameMsgArr.push(`\`\`\``);
            }

            gameMsgArr.push(`
              title: ${game.title}
              platform: ${game.platform}
            `);

            console.log(i, gameList.length);

            if (i + 1 === gameList.length) {
              gameMsgArr.push(`\`\`\``);
            }
          })
          gameMsg = gameMsgArr.join(' ');
        }).catch((error)=>{
          console.log(error.data.message)
        })
        // No results game message
        // gameMsg = `No results. Are you sure ${game} is the proper spelling?\nThere's also a chance that ${platform} is incorrect.`;
      } else {
        // There are results
        // Transform gameMsg into embed message
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
      console.log(error.response.data.message);
      return message.reply('There was an error. I\'ll let my master know. :service_dog:');
    })
    message.channel.send(gameMsg);
  }
}
