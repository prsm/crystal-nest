import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDynamicRoleDto } from './dto/create-dynamic-role.dto';
import { UpdateDynamicRoleDto } from './dto/update-dynamic-role.dto';

@Injectable()
export class DynamicRolesService {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {
    this.logger = new Logger(DynamicRolesService.name);
  }

  async create(createDynamicRoleDto: CreateDynamicRoleDto): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.create({ data: { ...createDynamicRoleDto, amountOfSubscribers: 0 } });
    this.logger.log(`Created dynamic role "${role.name}"`);
    return role;
  }

  async update(name: string, updateDynamicRoleDto: UpdateDynamicRoleDto): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.update({ where: { name }, data: { ...updateDynamicRoleDto } });
    this.logger.log(`Updated dynamic role "${role.name}"`);
    return role;
  }

  async remove(name: string): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.delete({ where: { name } });
    this.logger.log(`Removed dynamic role "${role.name}"`);
    return role;
  }

  async findOneByName(name: string): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.findUnique({ where: { name } });
    this.logger.log(`Queried dynamic role "${role.name}" by name`);
    return role;
  }

  async findOneById(id: string): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.findUnique({ where: { id } });
    this.logger.log(`Queried dynamic role "${role.name}" by id`);
    return role;
  }

  async findAll(): Promise<DynamicRole[]> {
    const roles = await this.prisma.dynamicRole.findMany({
      orderBy: [{ amountOfSubscribers: 'desc' }, { name: 'desc' }]
    });
    this.logger.log(`Fetched all roles`);
    return roles;
  }
}
