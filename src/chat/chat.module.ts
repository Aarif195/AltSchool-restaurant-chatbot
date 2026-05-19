import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './schemas/session.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
    PaymentModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}