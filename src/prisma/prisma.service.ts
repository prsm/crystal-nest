import { INestApplicationContext, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      rejectOnNotFound: {
        findUnique: true,
        findFirst: true
      }
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplicationContext): Promise<void> {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
