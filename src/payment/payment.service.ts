import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Session, SessionDocument } from '../chat/schemas/session.schema';

@Injectable()
export class PaymentService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {
    const key = this.configService.get<string>('paystack.secretKey');
    if (!key) {
      throw new Error('PAYSTACK_SECRET_KEY is not defined in the environment');
    }
    this.secretKey = key;
  }

  async initializeTransaction(amount: number, email: string, metadata: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            amount: Math.round(amount * 100), 
            email,
            metadata,
            callback_url: this.configService.get<string>('paystack.callbackUrl'),
          },
          {
            headers: {
              Authorization: `Bearer ${this.secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data.data;
    } catch (error) {
      throw new Error(`Paystack Init Error: ${error.response?.data?.message || error.message}`);
    }
  }

  verifyWebhookSignature(signature: string, rawBody: Buffer): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');
    return hash === signature;
  }

  async handleWebhookEvent(event: any) {
    if (event.event === 'charge.success') {
      const { metadata } = event.data;
      const deviceId = metadata?.deviceId;

      if (deviceId) {
        const session = await this.sessionModel.findOne({ deviceId });
        if (session && session.currentOrder.length > 0) {
          // Calculate total order cost
          const total = session.currentOrder.reduce((sum, item) => sum + item.price, 0);
          
          // Archive order items into history
          session.orderHistory.push({
            items: session.currentOrder,
            total,
            status: 'paid',
            paidAt: new Date(),
          });

          // Empty current active cart/order state
          session.currentOrder = [];
          session.currentState = 'MAIN_MENU';
          await session.save();
          console.log(`Payment successful processed for Device: ${deviceId}`);
        }
      }
    }
  }
}