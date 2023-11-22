import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import * as mongoose from 'mongoose'
import { Document } from 'mongoose'
import { Pair } from '../pairs/pair.schema'
import { Trader } from '../traders/trader.schema'
import { Side } from './side.enum'

export type TradeDocument = Trade & Document
@Schema()
export class Trade {
  @Prop()
  @ApiProperty({
    description: 'Creation date of the trade',
    type: Date,
    example: new Date()
  })
  startedDate: Date

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Trader' })
  @ApiProperty({
    description: 'Associated trader'
  })
  trader: Trader

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

  @Prop({ required: false })
  @ApiProperty({
    description: 'ID of the order associated to the trade',
    type: String,
    example: '88aabf4b-58f3-4af7-8f9b-d0d938407de8'
  })
  orderId?: string

  @Prop({ required: false })
  @ApiProperty({
    description: 'Profit associated to the trade',
    type: Number,
    example: 0.55
  })
  orderNetProfit?: number
}

export const TradeSchema = SchemaFactory.createForClass(Trade)
