import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Catalog, VerticalType } from './catalog.entity';
import { Client } from '../client/client.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  // Create a new catalog
  async createCatalog(
    data: Partial<Catalog>,
    clientId: number,
  ): Promise<Catalog> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    try {
      if (data.primary) {
        await this.updateExistingPrimary(data.vertical, clientId);
      }

      const catalog = this.catalogRepository.create({ ...data, client });
      return await this.catalogRepository.save(catalog);
    } catch (error) {
      this.logger.error('Error creating catalog', error.stack);
      if (error.name === 'QueryFailedError') {
        throw new BadRequestException(
          'Database error occurred during catalog creation',
        );
      }
      throw new InternalServerErrorException('Failed to create catalog');
    }
  }

  async getFilteredCatalogs(
    name?: string,
    multiLocale?: boolean,
    page: number = 1,
    rowsPerPage: number = 10,
  ): Promise<{ data: Catalog[]; total: number }> {
    const query = this.catalogRepository.createQueryBuilder('catalog');
    // Filter by name if provided
    if (name) {
      query.andWhere('catalog.name LIKE :name', { name: `%${name}%` });
    }
    // Filter by multiLocale if provided
    if (multiLocale !== undefined) {
      query.andWhere('JSON_LENGTH(catalog.locales) > 1 = :multiLocale', {
        multiLocale,
      });
    }
    query.orderBy('catalog.createdAt', 'DESC');
    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * rowsPerPage)
      .take(rowsPerPage)
      .getMany();

    return { data, total };
  }
  // Update a catalog
  async updateCatalog(
    id: number,
    data: Partial<Catalog>,
    clientId: number,
  ): Promise<Catalog> {
    const catalog = await this.catalogRepository.findOne({
      where: { id, client: { id: clientId } },
    });
    if (!catalog) throw new NotFoundException('Catalog not found');

    try {
      // Check if catalog is being set as primary or if vertical is changing
      if (
        (data.primary && !catalog.primary) || // Catalog is being set as primary
        (data.primary && data.vertical && data.vertical !== catalog.vertical) // Vertical is changing
      ) {
        await this.updateExistingPrimary(
          data.vertical || catalog.vertical,
          clientId,
        );
      }
      Object.assign(catalog, data);
      catalog.indexedAt = new Date();
      return await this.catalogRepository.save(catalog);
    } catch (error) {
      this.logger.error(`Error updating catalog with ID ${id}`, error.stack);
      if (error.name === 'QueryFailedError') {
        throw new BadRequestException(
          'Database error occurred during catalog update',
        );
      }
      throw new InternalServerErrorException('Failed to update catalog');
    }
  }

  // Delete a catalog
  async deleteCatalog(
    id: number,
    clientId: number,
  ): Promise<{ message: string }> {
    const catalog = await this.catalogRepository.findOne({
      where: { id, client: { id: clientId } },
    });
    if (!catalog) throw new NotFoundException('Catalog not found');

    try {
      await this.catalogRepository.remove(catalog);
      return { message: 'Catalog deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting catalog with ID ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to delete catalog');
    }
  }
  // Bulk delete catalogs
  async bulkDeleteCatalogs(
    ids: number[],
    clientId: number,
  ): Promise<{ message: string; deletedCount: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for bulk deletion');
    }

    try {
      // Find catalogs that match the given IDs and clientId
      const catalogs = await this.catalogRepository.find({
        where: { id: In(ids), client: { id: clientId } },
      });

      if (catalogs.length === 0) {
        throw new NotFoundException('No catalogs found for the provided IDs');
      }

      const deletedCount = catalogs.length;
      await this.catalogRepository.remove(catalogs);

      this.logger.log(
        `Bulk deleted ${deletedCount} catalogs for client ${clientId}`,
      );
      return { message: 'Catalogs deleted successfully', deletedCount };
    } catch (error) {
      this.logger.error('Error during bulk catalog deletion', error.stack);
      throw new InternalServerErrorException('Failed to delete catalogs');
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleIndexing(): Promise<void> {
    try {
      await this.indexAllCatalogs();
      console.log('Catalogs indexed successfully at', new Date());
    } catch (error) {
      console.error('Error during indexing process:', error);
    }
  }

  async indexAllCatalogs(): Promise<void> {
    const currentTimestamp = new Date();
    await this.catalogRepository
      .createQueryBuilder()
      .update(Catalog)
      .set({ indexedAt: currentTimestamp })
      .execute();
  }

  async indexSelectedCatalogs(
    ids: number[],
    clientId: number,
  ): Promise<{
    message: string;
    indexedCatalogs: { id: number; indexedAt: Date }[];
  }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('No IDs provided for indexing');
    }

    try {
      const catalogs = await this.catalogRepository.find({
        where: { id: In(ids), client: { id: clientId } },
      });
      if (catalogs.length === 0) {
        throw new NotFoundException('No catalogs found for the provided IDs');
      }
      const currentTimestamp = new Date();
      await this.catalogRepository
        .createQueryBuilder()
        .update(Catalog)
        .set({ indexedAt: currentTimestamp })
        .where('id IN (:...ids)', { ids })
        .andWhere('client.id = :clientId', { clientId })
        .execute();

      this.logger.log(
        `Indexed ${catalogs.length} catalogs for client ${clientId}`,
      );

      // Prepare the response with updated timestamps
      const indexedCatalogs = catalogs.map((catalog) => ({
        id: catalog.id,
        indexedAt: currentTimestamp,
      }));

      return {
        message: 'Catalogs indexed successfully',
        indexedCatalogs,
      };
    } catch (error) {
      this.logger.error('Error during catalog indexing', error.stack);
      throw new InternalServerErrorException('Failed to index catalogs');
    }
  }

  // Helper method to update existing primary catalog
  private async updateExistingPrimary(
    vertical: string,
    clientId: number,
  ): Promise<void> {
    try {
      await this.catalogRepository.update(
        {
          vertical: vertical as VerticalType,
          primary: true,
          client: { id: clientId },
        },
        { primary: false },
      );
    } catch (error) {
      this.logger.error('Error updating existing primary catalog', error.stack);
      throw new BadRequestException(
        'Failed to update existing primary catalog',
      );
    }
  }
}
