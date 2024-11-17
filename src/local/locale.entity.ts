// src/locale/locale.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Catalog } from '../catalog/catalog.entity';

@Entity('locale')
export class Locale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Example: "en_US", "es_ES"

  @ManyToMany(() => Catalog, (catalog) => catalog.locales)
  catalogs: Catalog[];
}
