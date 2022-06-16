import IConfiguration from './configuration.interface';

export default (): IConfiguration => ({
  discord: {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID,
    eventCategoryId: process.env.DISCORD_EVENT_CATEGORY_ID,
    archiveCategoryId: process.env.DISCORD_ARCHIVE_CATEGORY_ID,
    voiceCategoryId: process.env.DISCORD_VOICE_CATEGORY_ID,
    playerRoleId: process.env.DISCORD_PLAYER_ROLE_ID,
    memberRoleId: process.env.DISCORD_MEMBER_ROLE_ID
  },
  db: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    db: process.env.POSTGRES_DB,
    url: process.env.DATABASE_URL
  }
});
