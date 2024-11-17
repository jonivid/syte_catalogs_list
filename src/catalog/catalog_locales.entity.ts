// src/catalog_locales/catalog_locales.entity.ts

import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Catalog } from '../catalog/catalog.entity';
import { Locale } from '../local/locale.entity';

@Entity('catalog_locales')
export class CatalogLocales {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Catalog, (catalog) => catalog.id, { onDelete: 'CASCADE' })
  catalog: Catalog;

  @ManyToOne(() => Locale, (locale) => locale.id, { onDelete: 'CASCADE' })
  locale: Locale;
}
