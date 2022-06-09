import IDatabaseConfiguration from './interfaces/database-configuration.interface copy';
import IDiscordConfiguration from './interfaces/discord-configuration.interface';

export default interface IConfiguration {
  db: IDatabaseConfiguration;
  discord: IDiscordConfiguration;
}
