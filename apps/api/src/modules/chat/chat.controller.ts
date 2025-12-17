import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
    return this.chatService.createConversation(
      body.participant1Id,
      body.participant2Id,
      body.productId,
    );
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
