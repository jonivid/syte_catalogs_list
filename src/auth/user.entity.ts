import { Client } from 'src/client/client.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('user')
export class User {
  // Auto-increment primary key
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  // Unique, non-nullable username
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  username: string;

  // Non-nullable password
  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  // Unique, non-nullable email
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @ManyToOne(() => Client, (client) => client.users)
  client: Client;
}

// src/user/user.entity.ts
