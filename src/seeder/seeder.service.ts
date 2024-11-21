import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog, VerticalType } from '../catalog/catalog.entity'; // Adjust path
import { Client } from '../client/client.entity'; // Adjust path
import { User } from '../auth/user.entity'; // Adjust path

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Catalog) private catalogRepository: Repository<Catalog>,
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.seedClients();
    await this.seedUsers();
    await this.seedCatalogs();
    this.logger.log('Database seeding completed successfully!');
  }

  private async seedClients() {
    const existingClients = await this.clientRepository.find();
    if (existingClients.length === 0) {
      const clients = [
        {
          id: 1,
          name: 'Test Client',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await this.clientRepository.save(clients);
      this.logger.log('Clients seeded successfully.');
    } else {
      this.logger.log('Clients already exist. Skipping seed.');
    }
  }

  private async seedUsers() {
    const existingUsers = await this.userRepository.find();
    if (existingUsers.length === 0) {
      const users = [
        {
          id: 1,
          username: 'testuser', // Ensure username is included
          email: 'test@gmail.com',
          password:
            '$2a$10$4BoPOypigXDiI7QHaQRp5OmpSFbmsT1K82z1i9fFCImP9Wi1K4apy', // Pre-hashed password
          client: { id: 1 }, // Reference the client entity
        },
      ];
      await this.userRepository.save(users);
      this.logger.log('Users seeded successfully.');
    } else {
      this.logger.log('Users already exist. Skipping seed.');
    }
  }

  private async seedCatalogs() {
    const existingCatalogs = await this.catalogRepository.find();
    if (existingCatalogs.length === 0) {
      const catalogs = [
        {
          id: 1,
          name: 'Spring Fashion Trends',
          vertical: VerticalType.FASHION,
          primary: false,
          indexedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          client: { id: 1 }, // Reference the client entity
          locales: ['en_US', 'en_CA', 'es_ES'],
        },
        {
          id: 2,
          name: 'Modern Home Essentials',
          vertical: VerticalType.HOME,
          primary: false,
          indexedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          client: { id: 1 }, // Reference the client entity
          locales: ['en_US', 'fr_FR', 'es_ES'],
        },
        {
          id: 3,
          name: 'Modern Essentials',
          vertical: VerticalType.GENERAL,
          primary: false,
          indexedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          client: { id: 1 }, // Reference the client entity
          locales: ['en_US', 'fr_FR', 'es_ES'],
        },
      ];
      await this.catalogRepository.save(catalogs);
      this.logger.log('Catalogs seeded successfully.');
    } else {
      this.logger.log('Catalogs already exist. Skipping seed.');
    }
  }
}
