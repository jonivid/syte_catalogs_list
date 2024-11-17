import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Catalog } from './catalog.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  async createCatalog(
    @Body() data: Partial<Catalog>,
    @Request() req,
  ): Promise<Catalog> {
    const clientId = req.user.clientId;
    return await this.catalogService.createCatalog(data, clientId);
  }

  @Get()
  async getCatalogs(@Request() req): Promise<Catalog[]> {
    const clientId = req.user.clientId;
    return await this.catalogService.getCatalogs(clientId);
  }

  @Put(':id')
  async updateCatalog(
    @Param('id') id: number,
    @Body() data: Partial<Catalog>,
    @Request() req,
  ): Promise<Catalog> {
    const clientId = req.user.clientId;
    return await this.catalogService.updateCatalog(id, data, clientId);
  }

  @Delete(':id')
  async deleteCatalog(
    @Param('id') id: number,
    @Request() req,
  ): Promise<{ message: string }> {
    const clientId = req.user.clientId;
    return await this.catalogService.deleteCatalog(id, clientId);
  }

  @Post('bulk_delete')
  async bulkDeleteCatalogs(
    @Body('ids') ids: number[],
    @Request() req,
  ): Promise<{ message: string; deletedCount: number }> {
    const clientId = req.user.clientId;
    return await this.catalogService.bulkDeleteCatalogs(ids, clientId);
  }
}
