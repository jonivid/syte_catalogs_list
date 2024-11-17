// src/catalog/catalog.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Catalog } from './catalog.entity';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { Client } from '../client/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog, Client])],
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
