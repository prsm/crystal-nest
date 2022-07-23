import { Catch, DiscordArgumentMetadata, DiscordExceptionFilter } from '@discord-nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { MessageEmbed } from 'discord.js';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements DiscordExceptionFilter {
  async catch(
    exception: PrismaClientKnownRequestError,
    metadata: DiscordArgumentMetadata<'interactionCreate'>
  ): Promise<void> {
    const [interaction] = metadata.eventArgs;
    let errorMessage: string;

    switch (exception.code) {
      case 'P1000':
        errorMessage = 'Service cannot connect to the database, the provided credentials are invalid';
        break;
      case 'P1001':
        errorMessage = 'Service cannot reach database server';
        break;
      case 'P1002':
        errorMessage = 'Service can reach database server, but it timed out';
        break;
      case 'P1003':
        errorMessage = 'Missing database file';
        break;
      case 'P1008':
        errorMessage = 'Database operation timed out';
        break;
      case 'P1009':
        errorMessage = 'Database already exists on database server';
        break;
      case 'P1010':
        errorMessage = 'Access to database denied';
        break;
      case 'P1011':
        errorMessage = 'Error opening a TLS connection to the database';
        break;
      case 'P1012':
        errorMessage = 'P1012: Most commonly an error in the prisma schema';
        break;
      case 'P1013':
        errorMessage = 'The provided database string is invalid';
        break;
      case 'P1014':
        errorMessage = 'P1014: Underlying model does not exist';
        break;
      case 'P1015':
        errorMessage = 'Your Prisma schema is using features that are not supported for the version of the database';
        break;
      case 'P1016':
        errorMessage = 'Raw query had an incorrect number of parameters';
        break;
      case 'P1017':
        errorMessage = 'Database server has closed the connection';
        break;
      case 'P2000':
        errorMessage = 'Database server has closed the connection';
        break;
      case 'P2001':
        errorMessage = 'A record searched for does not exist';
        break;
      case 'P2002':
        errorMessage = 'Unique constraint failed';
        break;
      case 'P2003':
        errorMessage = 'Foreign key constraint failed';
        break;
      case 'P2004':
        errorMessage = 'A constraint failed on the database';
        break;
      case 'P2005':
        errorMessage = 'A value stored on this record is invalid';
        break;
      case 'P2006':
        errorMessage = 'A provided value is not valid';
        break;
      case 'P2007':
        errorMessage = 'Database validation error';
        break;
      case 'P2008':
        errorMessage = 'Failed to parse the query';
        break;
      case 'P2009':
        errorMessage = 'Failed to validate the query';
        break;
      case 'P2010':
        errorMessage = 'Raw query failed';
        break;
      case 'P2011':
        errorMessage = 'Null constraint violation';
        break;
      case 'P2012':
        errorMessage = 'Missing a required value';
        break;
      case 'P2013':
        errorMessage = 'Missing the required argument';
        break;
      case 'P2014':
        errorMessage = 'The change you are trying to make would violate the required relation';
        break;
      case 'P2015':
        errorMessage = 'A related record could not be found';
        break;
      case 'P2016':
        errorMessage = 'Query interpretation error';
        break;
      case 'P2017':
        errorMessage = 'The records for a relation are not connected';
        break;
      case 'P2018':
        errorMessage = 'The required connected records were not found';
        break;
      case 'P2019':
        errorMessage = 'Input error';
        break;
      case 'P2020':
        errorMessage = 'Value out of range for the type';
        break;
      case 'P2021':
        errorMessage = 'Required table does not exist in the current database';
        break;
      case 'P2022':
        errorMessage = 'Required column does not exist in the current database';
        break;
      case 'P2023':
        errorMessage = 'Inconsistent column data';
        break;
      case 'P2024':
        errorMessage = 'Timed out fetching a new connection from the connection pool';
        break;
      case 'P2025':
        errorMessage = 'An operation failed because it depends on one or more records that were required but not found';
        break;
      case 'P2026':
        errorMessage = 'The current database provider does not support a feature that the query used';
        break;
      case 'P2027':
        errorMessage = 'Multiple errors occurred on the database during query execution';
        break;
      case 'P2030':
        errorMessage = 'Cannot find a fulltext index to use for the search';
        break;
      default:
        errorMessage = 'internal error';
        break;
    }

    if (interaction.isCommand()) {
      const embed = new MessageEmbed({
        color: 'RED',
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
      }).addFields({
        name: exception.code,
        value: errorMessage
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}
