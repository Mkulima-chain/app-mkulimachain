import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  async createConversation(
    participant1Id: string,
    participant2Id: string,
    productId?: string,
  ) {
    // Check if conversation exists
    const existing = await this.conversationRepo.findOne({
      where: [
        { participant1Id, participant2Id, productId },
        {
          participant1Id: participant2Id,
          participant2Id: participant1Id,
          productId,
        },
      ],
    });

    if (existing) return existing;

    const conversation = this.conversationRepo.create({
      participant1Id,
      participant2Id,
      productId,
    });

    return this.conversationRepo.save(conversation);
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
