import { Catch, DiscordArgumentMetadata, DiscordExceptionFilter } from '@discord-nestjs/core';
import { ValidationError } from 'class-validator';
import { EmbedBuilder } from 'discord.js';

@Catch(ValidationError)
export class CommandValidationFilter implements DiscordExceptionFilter {
  async catch(exceptionList: ValidationError[], metadata: DiscordArgumentMetadata<'interactionCreate'>): Promise<void> {
    const [interaction] = metadata.eventArgs;

    const embeds = exceptionList.map(exception =>
      new EmbedBuilder().setColor('Red').addFields(
        Object.values(exception.constraints).map(value => ({
          name: exception.property,
          value
        }))
      )
    );

    if (interaction.isCommand()) {
      await interaction.reply({ embeds, ephemeral: true });
    }
  }
}
