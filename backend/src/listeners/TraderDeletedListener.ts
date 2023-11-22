import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { OnEvent } from '@nestjs/event-emitter'
import { Trade, TradeDocument } from '../models/trades/trade.schema'
import { InjectModel } from '@nestjs/mongoose'
import { TraderDeletedEvent } from '../events/TraderDeletedEvent'

@Injectable()
export class TraderDeletedListener {
  constructor(
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>
  ) {}

  @OnEvent('trader.deleted')
  async handleTraderDeletedEvent(event: TraderDeletedEvent) {
    const trades = await this.tradeModel.find({ trader: event._id })

    const mappedtrades = trades.map((element) => element._id.toString())

    await this.tradeModel.deleteMany({ _id: { $in: mappedtrades } })
  }
}
