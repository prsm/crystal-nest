import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDynamicRoleDto } from './dto/create-dynamic-role.dto';
import { UpdateDynamicRoleDto } from './dto/update-dynamic-role.dto';

@Injectable()
export class DynamicRolesRepository {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {
    this.logger = new Logger(DynamicRolesRepository.name);
  }

  async create(
    createdBy: string,
    createDynamicRoleDto: CreateDynamicRoleDto,
    channelId: string,
    roleId: string
  ): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.create({
      data: { ...createDynamicRoleDto, channelId, roleId, amountOfSubscribers: 0, createdBy }
    });
    this.logger.log(`Created dynamic role "${role.name}"`);
    return role;
  }

  async addSubscriber(name: string): Promise<DynamicRole> {
    return this.prisma.dynamicRole.update({ where: { name }, data: { amountOfSubscribers: { increment: 1 } } });
  }

  async removeSubscriber(name: string): Promise<DynamicRole> {
    return this.prisma.dynamicRole.update({ where: { name }, data: { amountOfSubscribers: { decrement: 1 } } });
  }

  async update(updateDynamicRoleDto: UpdateDynamicRoleDto): Promise<DynamicRole> {
    const { name, newName, ...rest } = updateDynamicRoleDto;
    const role = await this.prisma.dynamicRole.update({ where: { name }, data: { name: newName, ...rest } });
    this.logger.log(`Updated dynamic role "${role.name}"`);
    return role;
  }

  async remove(name: string): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.delete({ where: { name } });
    this.logger.log(`Removed dynamic role "${role.name}"`);
    return role;
  }

  async findOneByName(name: string): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.findUniqueOrThrow({ where: { name } });
    this.logger.log(`Queried dynamic role "${role.name}" by name`);
    return role;
  }

  async findOneById(id: string): Promise<DynamicRole> {
    const role = await this.prisma.dynamicRole.findUniqueOrThrow({ where: { id } });
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
