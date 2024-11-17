// src/client/client.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, Length } from 'class-validator';
import { User } from '../auth/user.entity';
import { Catalog } from 'src/catalog/catalog.entity';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  @Length(1, 255)
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.client)
  users: User[];
  @OneToMany(() => Catalog, (catalog) => catalog.client)
  catalogs: Catalog[];
}
