import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamicRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDynamicRoleDto } from './dto/create-dynamic-role.dto';
import { UpdateDynamicRoleDto } from './dto/update-dynamic-role.dto';

@Injectable()
export class DynamicRolesService {
  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {}

  async create(createDynamicRoleDto: CreateDynamicRoleDto): Promise<DynamicRole> {
    return this.prisma.dynamicRole.create({ data: { ...createDynamicRoleDto, amountOfSubscribers: 0 } });
  }

  async update(name: string, updateDynamicRoleDto: UpdateDynamicRoleDto): Promise<DynamicRole> {
    return this.prisma.dynamicRole.update({ where: { name }, data: { ...updateDynamicRoleDto } });
  }

  async remove(name: string): Promise<DynamicRole> {
    return this.prisma.dynamicRole.delete({ where: { name } });
  }

  async findOneByName(name: string): Promise<DynamicRole> {
    return this.prisma.dynamicRole.findUnique({ where: { name } });
  }

  async findOneById(id: string): Promise<DynamicRole> {
    return this.prisma.dynamicRole.findUnique({ where: { id } });
  }

  async findAll(): Promise<DynamicRole[]> {
    return this.prisma.dynamicRole.findMany({ orderBy: [{ amountOfSubscribers: 'desc' }, { name: 'desc' }] });
  }
}
