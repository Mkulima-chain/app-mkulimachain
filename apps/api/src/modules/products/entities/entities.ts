import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IProduct } from '../interfaces/iproducts';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { IHarvest } from '@/modules/harvest/interfaces/iharvest';

@Entity('products')
export class ProductEntity implements IProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ type: 'varchar', length: 100 })
  name!: string;
  @Column({ type: 'varchar', length: 100 })
  unit!: string;
  @Column({ type: 'varchar', length: 100 })
  description!: string;
  @Column({ type: 'jsonb' })
  image?: string[];
  @OneToMany(() => HarvestEntity, (harvest) => harvest.product)
  harvests?: IHarvest[];
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
}
