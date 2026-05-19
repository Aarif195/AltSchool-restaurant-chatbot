import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async handleMessage(
    @Body('message') message: string,
    @Headers('x-device-id') deviceId: string, 
  ) {
    // To A Generic session ID if header is missing
    const sessionKey = deviceId || 'default-device';
    return this.chatService.processMessage(sessionKey, message);
  }
}