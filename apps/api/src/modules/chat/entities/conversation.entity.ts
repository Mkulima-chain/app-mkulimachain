import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { ProductEntity } from '../../products/entities/entities';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany('MessageEntity', 'conversation')
  messages?: any[];

  // Participant 1 (usually Buyer)
  @Column({ type: 'uuid' })
  @Index()
  participant1Id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'participant1Id' })
  participant1!: UserEntity;

  // Participant 2 (usually Seller/Farmer)
  @Column({ type: 'uuid' })
  @Index()
  participant2Id!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'participant2Id' })
  participant2!: UserEntity;

  // Optional: Linked Product
  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'productId' })
  product?: ProductEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
