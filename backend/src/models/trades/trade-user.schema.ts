import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import * as mongoose from 'mongoose'
import { Document } from 'mongoose'
import { Pair } from '../pairs/pair.schema'
import { User } from '../users/user.schema'
import { Side } from './side.enum'
import { Trade } from './trade.schema'

export type TradeUserDocument = TradeUser & Document
@Schema({ collection: 'user_trades' })
export class TradeUser {
  @Prop()
  @ApiProperty({
    description: 'Creation date of the trade',
    type: Date,
    example: new Date()
  })
  startedDate: Date

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Trade' })
  @ApiProperty({
    description: 'Associated trade'
  })
  associatedTrade: Trade

  @Prop()
  @ApiProperty({
    description: 'Status of the trade',
    type: Boolean,
    example: false
  })
  isOpen: boolean

  @Prop()
  @ApiProperty({
    description: 'Leverage of the trade',
    type: Number,
    example: 3
  })
  leverage: number

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pair' })
  @ApiProperty({
    description: 'Associated symbol'
  })
  symbol: Pair

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @ApiProperty({
    description: 'Associated user'
  })
  user: User

  @Prop()
  @ApiProperty({
    description: 'Size of the trade',
    type: Number,
    example: 0.01
  })
  size: number

  @Prop()
  @ApiProperty({
    description: 'Side of the trade',
    type: Side,
    example: 'Buy'
  })
  side: Side

  @Prop()
  @ApiProperty({
    description: 'Entry price of the trade',
    type: Number,
    example: 1595.5
  })
  entryPrice: number

  @Prop({ required: false })
  @ApiProperty({
    description: 'TP price of the trade',
    type: Number,
    example: 1595.5
  })
  takeProfitPrice?: number

  @Prop({ required: false })
  @ApiProperty({
    description: 'SL price of the trade',
    type: Number,
    example: 1595.5
  })
  stopLossPrice?: number

  @Prop({ required: false })
  @ApiProperty({
    description: 'Closed date of the trade',
    type: Date,
    example: new Date()
  })
  closedDate?: Date

  @Prop({ required: false })
  @ApiProperty({
    description: 'Closed price of the trade',
    type: Number,
    example: 1595.5
  })
  closedPrice?: number
}

export const TradeUserSchema = SchemaFactory.createForClass(TradeUser)
