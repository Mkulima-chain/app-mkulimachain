import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICooperative } from '../interfaces/icooperative';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Entity('cooperatives')
export class CooperativeEntity implements ICooperative {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({ type: 'varchar', length: 100 })
  leader!: string;

  @OneToMany(() => FarmerEntity, (farmer) => farmer.cooperative)
  farmers?: FarmerEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
