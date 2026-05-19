import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';

import type { RawBodyRequest } from '@nestjs/common';
import type { Request, Response } from 'express';

import { PaymentService } from './payment/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!req.rawBody) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing raw body');
    }

    const isValid = this.paymentService.verifyWebhookSignature(signature, req.rawBody);

    if (!isValid) {
      return res.status(HttpStatus.BAD_REQUEST).send('Invalid Signature');
    }

    await this.paymentService.handleWebhookEvent(req.body);
    
    return res.status(HttpStatus.OK).send('Webhook Received');
  }
}