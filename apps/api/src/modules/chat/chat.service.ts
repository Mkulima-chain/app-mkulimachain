import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { UserEntity } from '../auth/entities/user.entity';
import { ProductEntity } from '../products/entities/entities';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async createConversation(
    participant1Id: string,
    participant2Id: string,
    productId?: string,
  ) {
    // Valider que les participants existent
    const [participant1, participant2] = await Promise.all([
      this.userRepo.findOne({ where: { id: participant1Id } }),
      this.userRepo.findOne({ where: { id: participant2Id } }),
    ]);

    if (!participant1) {
      throw new NotFoundException(
        `Participant 1 avec l'ID ${participant1Id} n'existe pas`,
      );
    }

    if (!participant2) {
      throw new NotFoundException(
        `Participant 2 avec l'ID ${participant2Id} n'existe pas`,
      );
    }

    if (participant1Id === participant2Id) {
      throw new BadRequestException(
        'Un utilisateur ne peut pas créer une conversation avec lui-même',
      );
    }

    // Valider le produit si fourni
    if (productId) {
      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Produit avec l'ID ${productId} n'existe pas`,
        );
      }
    }

    // Check if conversation exists
    // Construire la requête selon que productId est fourni ou non
    let existing;
    if (productId) {
      existing = await this.conversationRepo.findOne({
        where: [
          { participant1Id, participant2Id, productId },
          {
            participant1Id: participant2Id,
            participant2Id: participant1Id,
            productId,
          },
        ],
      });
    } else {
      // Si pas de productId, chercher une conversation sans productId
      existing = await this.conversationRepo.findOne({
        where: [
          { participant1Id, participant2Id, productId: null },
          {
            participant1Id: participant2Id,
            participant2Id: participant1Id,
            productId: null,
          },
        ],
      });
    }

    if (existing) {
      return existing;
    }

    // Créer la nouvelle conversation
    const conversation = this.conversationRepo.create({
      participant1Id,
      participant2Id,
      productId: productId || null,
    });

    try {
      return await this.conversationRepo.save(conversation);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      throw new BadRequestException(
        `Erreur lors de la création de la conversation: ${error.message}`,
      );
    }
  }

  async getConversations(userId: string) {
    return this.conversationRepo.find({
      where: [{ participant1Id: userId }, { participant2Id: userId }],
      relations: ['participant1', 'participant2', 'product', 'messages'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getMessages(conversationId: string) {
    return this.messageRepo.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(senderId: string, conversationId: string, content: string) {
    const message = this.messageRepo.create({
      senderId,
      conversationId,
      content,
    });

    await this.messageRepo.save(message);

    // Update conversation timestamp
    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });

    return this.messageRepo.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });
  }
}
