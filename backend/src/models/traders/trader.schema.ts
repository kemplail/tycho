import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TraderDocument = Trader & Document

@Schema()
export class Trader {
  @Prop()
  name: string
  @Prop()
  leaderMark: string
  @Prop()
  addedDate: Date
  @Prop()
  note: string
}

export const TraderSchema = SchemaFactory.createForClass(Trader)
