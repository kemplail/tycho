import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PairDocument = Pair & Document

@Schema()
export class Pair {
  @Prop()
  title: string
}

export const PairSchema = SchemaFactory.createForClass(Pair)
