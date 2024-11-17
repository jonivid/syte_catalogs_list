// src/catalog/catalog.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsBoolean,
  IsEnum,
  IsString,
  Length,
  ArrayNotEmpty,
} from 'class-validator';
import { Client } from '../client/client.entity';

export enum VerticalType {
  FASHION = 'fashion',
  HOME = 'home',
  GENERAL = 'general',
}

@Entity('catalog')
export class Catalog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @Length(1, 255)
  name: string;

  @Column({ type: 'enum', enum: VerticalType })
  @IsEnum(VerticalType)
  vertical: VerticalType;

  @Column({ default: false })
  @IsBoolean()
  primary: boolean;

  @Column('simple-array')
  @ArrayNotEmpty()
  locales: string[];

  @Column({ type: 'timestamp', nullable: true })
  indexedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.catalogs)
  client: Client;
}
