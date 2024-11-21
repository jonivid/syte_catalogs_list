import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Catalog } from '../catalog/catalog.entity';
import { Client } from '../client/client.entity';
import { User } from '../auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Catalog, Client, User]), // Register entities here
  ],
  providers: [SeederService],
  exports: [SeederService], // Export if needed elsewhere
})
export class SeederModule {}
