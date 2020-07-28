module.exports = {
  name: 'dnd',
  alias: 'd&d',
  short: 'DnD Helper',
  description: 'Has built in commands to create a new manageable campaign in the server complete with categories, channels and roles.',
  usage: '[action: (create, add)] [arguments: (dm, playerlist)]',
  cooldown: 5, //  command cooldown in seconds
  async execute(message, args) {
    // Global Variables
    const guild = message.guild;

    // Pull Command from Arguments
    const newCommand = args.shift();

    /**
     * Add Player to Campaign
     * @params mentioned player
     * @params campaign
     **/
    if (newCommand === 'add') {
      // Extract campaign from arguments
      const campaign = args.filter(c => c.substring(0, 1) !== '<').join('-');

      // Role to Give to User
      const role = message.guild.roles.cache.find(role => role.name.toLowerCase() === campaign.toLowerCase() );
    
      // Loop over mentions
      message.mentions.members.each((m) => {
        // Give roles to mentioned members
        m.roles.add(role.id).then(() => {
          message.channel.send(`@${m.user.username} has been added to the campaign.`);
        }).catch(() => {
          console.error
          message.channel.send('There was an error adding players to campaign.');
        });
      })
      
      // 
    } else if (newCommand === 'create') {
      /**
       * Create Campaign Category and Roles
       * @params campaign
       **/

      const returnMsg = [];
      const allowFlags = [
        'VIEW_CHANNEL',
        'ADD_REACTIONS',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'CONNECT',
        'SPEAK',
        'CHANGE_NICKNAME'
      ];

      if (message.author.id === message.guild.ownerID) {
        // Campaign is Next Argument (join w/ hyphens)
        const campaign = args.filter(c => c.substring(0, 1) !== '<').join('-');

        // Create role for campaign dm
        if (!(guild.roles.cache.find(role => role.name.toLowerCase() === `${campaign.toLowerCase()}-dm`))) {
          await guild.roles.create({
            data: {
              name: `${campaign}-dm`,
              color: 'RED',
            },
            reason: 'To manage campaign',
          }).then( async (dmrole) => {
            // Add dm role to mentioned user
            const dm = message.mentions.members.first();

            await dm.roles.add(dmrole.id).then(() => {
              returnMsg.push(`<@${dm.user.id}> is now the DM of ${campaign}`);
            }).catch((e) => {
              console.error(e);
              returnMsg.push('Unable to add dm to the campaign');
            });

            // Create new role for players in campaign 
            if (!(guild.roles.cache.find(role => role.name.toLowerCase() === campaign.toLowerCase()))) {
              await guild.roles.create({
                data: {
                  name: campaign,
                  color: 'BLUE',
                },
                reason: 'Started a new campaign!',
              })
              .then(async (role) => {
                returnMsg.push('`+ New Role Created...`');

                // Create Category
                if (
                  !(guild.channels.cache.find((c) => {
                    c.name.toLowerCase() === campaign && c.type === 'category'}
                  ))
                ) {
                  await guild.channels.create(
                    campaign,
                    {
                      type: 'category',
                      reason: 'Started a new campaign',
                      permissionOverwrites: [
                        {
                          id: dmrole.id,
                          type: 'role',
                          allow: allowFlags
                        }
                      ]
                    }).then( async (cat) => {
                      returnMsg.push('`+ New Category Created...`');
      
                      // Create General Chat Channel
                      await guild.channels.create(
                        'general-chat',
                        {
                          type: 'text',
                          parent: cat.id,
                          reason: 'For discussing the campaign',
                          permissionOverwrites: [
                            {
                              id: role.id,
                              type: 'role',
                              allow: allowFlags
                            }
                          ]
                        }).then(() => {
                          returnMsg.push('`+ General Chat channel created..`.')
                        })
                        .catch(() => {
                          returnMsg.push('- I\'m sorry. There was an error creating the General Chat channel.');
                        })
      
                      // Create Notes Channel
                      await guild.channels.create(
                        'campaign-notes',
                        {
                          type: 'text',
                          parent: cat.id,
                          reason: 'To help keep notes tidy and in one place',
                          permissionOverwrites: [
                            {
                              id: role.id,
                              type: 'role',
                              allow: allowFlags
                            }
                          ]
                        }).then(() => {
                          returnMsg.push('`+ Campaign Notes channel created...`');
                        })
                        .catch(() => {
                          returnMsg.push('`- I\'m sorry. There was an error creating the Campaign Notes channel.`');
                        })
      
                    }).catch(() => {
                      returnMsg.push('`- I\'m sorry. There was an error creating the campaign category.`');
                    });
                }
              }).catch(() => {
                returnMsg.push('`- I\'m sorry. There was an error creating the campaign role.`');
              });
            } // END Role
          }).catch(() => {
            returnMsg.push('`- I\'m sorry. There was an error creating the campaign role.`');
          })

          message.channel.send(`${returnMsg.join(' ')}`);
        } // END DM Role
      } else {
        message.reply('you do not have permission to do that.');
      }
    }
  }
}