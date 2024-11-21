import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { Client } from './client/client.entity';
import { Catalog } from './catalog/catalog.entity';
import { CatalogModule } from './catalog/catalog.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Asynchronous TypeORM configuration using ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Client, Catalog], // Include your entities here
        synchronize: configService.get<boolean>('DB_SYNC') || true, // Use synchronize only in development
        autoLoadEntities: true, // Automatically load entities
        logging: false, // Enable / Disable logging for debugging 
      }),
    }),
    // Import the Auth module
    AuthModule,
    CatalogModule,
    SeederModule,
  ],
})
export class AppModule {}
