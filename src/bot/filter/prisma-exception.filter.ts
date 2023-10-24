import { Catch, DiscordArgumentMetadata, DiscordExceptionFilter } from '@discord-nestjs/core';
import { Prisma } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements DiscordExceptionFilter {
  async catch(
    exception: Prisma.PrismaClientKnownRequestError,
    metadata: DiscordArgumentMetadata<'interactionCreate'>
  ): Promise<void> {
    const [interaction] = metadata.eventArgs;
    console.log(
      '🚀 ~ file: prisma-exception.filter.ts ~ line 28 ~ PrismaExceptionFilter ~ exception.cause ',
      JSON.stringify(exception, undefined, 2)
    );

    if (interaction.isCommand()) {
      const embed = new EmbedBuilder({
        author: {
          name: `Prisma ${exception.clientVersion}`,
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
          name: exception.code,
          value: exception.cause
            ? (exception.cause as string)
            : exception.meta?.cause
            ? (exception.meta.cause as string)
            : 'Internal error'
        });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
