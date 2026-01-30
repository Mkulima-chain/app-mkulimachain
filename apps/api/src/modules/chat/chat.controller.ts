import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('chat')
@Public() // Allow access to chat endpoints without authentication
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(
    @Body()
    body: {
      participant1Id: string;
      participant2Id: string;
      productId?: string;
    },
  ) {
    try {
      if (!body.participant1Id || !body.participant2Id) {
        throw new HttpException(
          'participant1Id et participant2Id sont requis',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.chatService.createConversation(
        body.participant1Id,
        body.participant2Id,
        body.productId,
      );
    } catch (error: any) {
      console.error('Error in createConversation:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Erreur lors de la création de la conversation',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }
}
