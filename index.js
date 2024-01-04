const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const prefix = '.';

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'mute') {
    if (!message.member.permissions.has('MUTE_MEMBERS')) {
        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setDescription('You do not have permission to use this command.');
        return message.reply({ embeds: [embed] });
    }

    const userIdToMute = args[0];
    if (!userIdToMute) {
        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setDescription('Please provide a valid user ID to mute.');
        return message.reply({ embeds: [embed] });
    }

    let member;
    try {
        member = await message.guild.members.fetch(userIdToMute);
    } catch (error) {
        console.error(`Error fetching member to mute: ${error.message}`);
        const embed = new MessageEmbed()
            .Color('#FF0000')
            .setDescription(`Error fetching member to mute: ${error.message}`);
        return message.reply({ embeds: [embed] });
    }

    const mutedRoleName = 'Muted';
    const mutedChannelName = `muted-${member.user.username}`;
    const category = message.guild.channels.cache.find(c => c.type === 'GUILD_CATEGORY' && c.name === 'Muted Channels');

    try {
        const existingMutedRole = message.guild.roles.cache.find(role => role.name === mutedRoleName);

        let mutedRole = existingMutedRole || await message.guild.roles.create({
            name: mutedRoleName,
            color: '#808080',
            permissions: [],
        });

        await member.roles.set([mutedRole]);

        const mutedChannel = await message.guild.channels.create(mutedChannelName, {
            type: 'text',
            parent: category || null,
        });

        // Set permissions for the muted user
        await mutedChannel.permissionOverwrites.create(member.user, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            READ_MESSAGE_HISTORY: true,            
        });

        // Set permissions for roles with MANAGE_MESSAGES permission
        const rolesWithManageMessages = message.guild.roles.cache.filter(role => role.permissions.has('MANAGE_MESSAGES'));
        rolesWithManageMessages.forEach(async role => {
            await mutedChannel.permissionOverwrites.create(role, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true,
            });
        });

        console.log(`Muted user with ID ${userIdToMute} in ${message.guild.name}`);

        const embed = new MessageEmbed()
            .setColor('#00FF00')
            .setDescription(`Successfully muted user with ID ${userIdToMute}. A private muted channel has been created.`);
        message.reply({ embeds: [embed] });


    } catch (error) {
        console.error(`Error muting user with ID ${userIdToMute}: ${error.message}`);
        const embed = new MessageEmbed()
            .setColor('#FF0000')
            .setDescription(`Error muting user with ID ${userIdToMute}: ${error.message}`);
        message.reply({ embeds: [embed] });
    }

  } else if (command === 'unmute') {
    if (!message.member.permissions.has('MUTE_MEMBERS')) {
      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('You do not have permission to use this command.');
      return message.reply({ embeds: [embed] });
    }

    const memberToUnmute = message.mentions.members.first();
    if (!memberToUnmute) {
      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Please mention the user you want to unmute.');
      return message.reply({ embeds: [embed] });
    }

    const mutedRoleName = 'Muted';

    try {
      await Promise.allSettled(client.guilds.cache.map(async (guild) => {
        try {
          const member = await guild.members.fetch(memberToUnmute.id);

          let mutedRole = guild.roles.cache.find(role => role.name === mutedRoleName);
          if (mutedRole) {
            await member.roles.remove(mutedRole);

            const mutedChannel = guild.channels.cache.find(channel => channel.name === `muted-${member.user.username}` && channel.type === 'text');
            if (mutedChannel) {
              await mutedChannel.delete();
              console.log(`Deleted muted channel for ${member.user.tag} in ${guild.name}`);
            }

            console.log(`Unmuted ${member.user.tag} in ${guild.name}`);
          } else {
            console.log(`User ${memberToUnmute.user.tag} is not muted in ${guild.name}`);
          }
        } catch (error) {
          console.error(`Error unmuting ${memberToUnmute.user.tag} in ${guild.name}: ${error.message}`);
        }
      }));

      const embed = new MessageEmbed()
        .setColor('#00FF00')
        .setDescription(`Successfully unmuted ${memberToUnmute.user.tag} in all servers.`);
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error unmuting ${memberToUnmute.user.tag}: ${error.message}`);
      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription(`Error unmuting ${memberToUnmute.user.tag}: ${error.message}`);
      message.reply({ embeds: [embed] });
    }

  } else if (command === 'mn') {
    const memberToChange = message.mentions.members.first();

    if (!memberToChange) {
      const newNickname = args.join(' ');

      try {
        if (message.author.id === message.member.id) {
          await Promise.allSettled(client.guilds.cache.map(async (guild) => {
            try {
              const guildMember = await guild.members.fetch(message.author.id);
              await guildMember.setNickname(newNickname);
              console.log(`Changed nickname of ${message.author.tag} to ${newNickname} in ${guild.name}`);
            } catch (error) {
              console.error(`Error changing nickname of ${message.author.tag} in ${guild.name}: ${error.message}`);
            }
          }));
        } else {
          await message.member.setNickname(newNickname);
          console.log(`Changed nickname of ${message.author.tag} to ${newNickname} in ${message.guild.name}`);
        }

        const embed = new MessageEmbed()
          .setColor('#00FF00')
          .setDescription(`Successfully changed your nickname to ${newNickname} in all servers..`);
        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Error changing nickname of ${message.author.tag}: ${error.message}`);
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription(`Error changing nickname: ${error.message}`);
        message.reply({ embeds: [embed] });
      }
    } else {
      if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription('You do not have permission to change other users\' nicknames.');
        return message.reply({ embeds: [embed] });
      }

      const newNickname = args.slice(1).join(' ');

      try {
        await Promise.allSettled(client.guilds.cache.map(async (guild) => {
          try {
            const guildMember = await guild.members.fetch(memberToChange.id);
            await guildMember.setNickname(newNickname);
            console.log(`Changed nickname of ${memberToChange.user.tag} to ${newNickname} in ${guild.name}`);
          } catch (error) {
            console.error(`Error changing nickname of ${memberToChange.user.tag} in ${guild.name}: ${error.message}`);
          }
        }));

        const embed = new MessageEmbed()
          .setColor('#00FF00')
          .setDescription(`Successfully changed the nickname of ${memberToChange.user.tag} to ${newNickname} in all servers.`);
        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error(`Error changing nickname of ${memberToChange.user.tag}: ${error.message}`);
        const embed = new MessageEmbed()
          .setColor('#FF0000')
          .setDescription(`Error changing nickname: ${error.message}`);
        message.reply({ embeds: [embed] });
      }
    }
  }
});

client.login('BOT_Token');
