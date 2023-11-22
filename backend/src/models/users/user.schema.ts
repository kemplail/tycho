import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'
import { Trader } from '../traders/trader.schema'

export type UserDocument = User & Document

@Schema()
export class User {
  @Prop()
  username: string
  @Prop()
  password: string
  @Prop()
  apiKey: string
  @Prop()
  apiSecret: string
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trader' }],
    default: []
  })
  traders: Trader[]
}

export const UserSchema = SchemaFactory.createForClass(User)
