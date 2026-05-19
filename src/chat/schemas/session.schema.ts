import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ default: 'MAIN_MENU' })
  currentState: string;

  @Prop({ type: Array, default: [] })
  currentOrder: any[];

  @Prop({ type: Array, default: [] })
  orderHistory: any[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);