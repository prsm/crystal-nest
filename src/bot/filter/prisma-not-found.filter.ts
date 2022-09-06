import { Catch, DiscordArgumentMetadata, DiscordExceptionFilter } from '@discord-nestjs/core';
import { NotFoundError } from '@prisma/client/runtime';
import { EmbedBuilder } from 'discord.js';

@Catch(NotFoundError)
export class PrismaNotFoundExceptionFilter implements DiscordExceptionFilter {
  async catch(exception: NotFoundError, metadata: DiscordArgumentMetadata<'interactionCreate'>): Promise<void> {
    const [interaction] = metadata.eventArgs;

    if (interaction.isCommand()) {
      const embed = new EmbedBuilder({
        author: {
          name: 'Prisma',
          iconURL: 'https://avatars.githubusercontent.com/u/17219288?s=200&v=4',
          url: 'https://www.prisma.io/'
        },
        footer: {
          text:
            'This is a error message from the ORM.\n' +
            'If this does not make sense to you, write a message with the error code to a moderator or developer.'
        }
      })
        .setColor('Red')
        .addFields({
          name: exception.name,
          value: exception.message
        });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
