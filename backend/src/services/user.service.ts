import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateUserDto } from '../models/users/dto/create-user.dto'
import { Model } from 'mongoose'
import { User, UserDocument } from '../models/users/user.schema'
import { IdParam } from '../models/IdParams'
import * as bcrypt from 'bcrypt'
import { SetTradersDto } from 'src/models/users/dto/set-traders.dto'
import { Trader, TraderDocument } from 'src/models/traders/trader.schema'
import { ObjectId } from 'mongodb'
import { GetTraderInfosDto } from 'src/models/traders/get-trader-infos.dto'
import { TradeUser } from 'src/models/trades/trade-user.schema'
import { TradeUserDocument } from 'src/models/trades/trade-user.schema'
import { AggregationService } from './aggregation.service'
import { CcxtService } from 'nestjs-ccxt'
import { Pair, PairDocument } from 'src/models/pairs/pair.schema'
import { GetTradesDetailsDto } from 'src/models/trades/get-trades-details.dto'
import { GetTraderLastTradesDto } from 'src/models/traders/get-trader-last-trades.dto'
import { CloseTradeDto } from 'src/models/users/dto/close-trade.dto'
import { Exchange } from 'ccxt'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Trader.name) private traderModel: Model<TraderDocument>,
    @InjectModel(TradeUser.name)
    private tradeUserModel: Model<TradeUserDocument>,
    @InjectModel(Pair.name) private pairModel: Model<PairDocument>,
    private aggregationService: AggregationService,
    private ccxtService: CcxtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      await this.findByUsername(createUserDto.username)
    } catch (e) {
      if (e instanceof NotFoundException) {
        const saltOrRounds = 10
        const hash = await bcrypt.hash(createUserDto.password, saltOrRounds)

        const { password, ...userWithoutPass } = createUserDto
        const userToCreate = { password: hash, ...userWithoutPass }
        const createdUser = new this.userModel(userToCreate)

        return createdUser.save()
      }
    }

    throw new ConflictException()
  }

  async findAll(): Promise<User[]> {
    return this.userModel
      .find({}, { password: 0, apiKey: 0, apiSecret: 0 })
      .exec()
  }

  async findOne(param: IdParam) {
    const userFound = await this.userModel
      .findOne({ _id: param.id }, { password: 0 })
      .populate('traders')
      .exec()

    if (!userFound) {
      return new NotFoundException()
    } else {
      return userFound
    }
  }

  async deleteOne(param: IdParam) {
    const userDeleted = await this.userModel.deleteOne({ _id: param.id }).exec()
    return userDeleted
  }

  async findByUsername(username: string) {
    const user = await this.userModel
      .findOne({ username: username }, { apiKey: 0, apiSecret: 0 })
      .exec()

    if (!user) {
      throw new NotFoundException()
    }
    return user
  }

  async setTraders(setTradersDto: SetTradersDto, param: IdParam) {
    const traders = await this.traderModel.find({
      _id: {
        $in: setTradersDto.traders.map((element) => new ObjectId(element))
      }
    })

    return await this.userModel.findOneAndUpdate({ _id: param.id }, { traders })
  }

  async getUserBybitInfos(userId: IdParam) {
    //Check if the trader exists
    const user = await this.userModel.findOne({
      _id: new ObjectId(userId.id)
    })
    //If not, return an exception
    if (!user) {
      return new NotFoundException('Trader not found')
    }

    let client
    try {
      client = await this.ccxtService.getClient('bybit', {
        apiKey: user.apiKey,
        secret: user.apiSecret
      })
    } catch (error) {
      console.log('Error with Bybit API')
      console.log(error)
      return new ServiceUnavailableException(
        'Impossible to connect with Bybit API'
      )
    }

    const balance = await client.fetchBalance()

    return {
      available_balance: Number(
        balance['info']['result']['USDT']['available_balance']
      ),
      total_balance: Number(balance['info']['result']['USDT']['equity'])
    }
  }

  async getUserInfos(userId: IdParam, getTraderInfosDto: GetTraderInfosDto) {
    //Check if the trader exists
    const user = await this.userModel.findOne({
      _id: new ObjectId(userId.id)
    })
    //If not, return an exception
    if (!user) {
      return new NotFoundException('Trader not found')
    }

    let matchClause

    if (getTraderInfosDto.temporality !== 'ALWAYS') {
      matchClause = {
        $and: [
          { user: new ObjectId(userId.id) },
          {
            $expr: {
              $gt: [
                '$startedDate',
                {
                  $dateSubtract: {
                    startDate: '$$NOW',
                    unit: this.aggregationService.generateDayWithTemporality(
                      getTraderInfosDto.temporality
                    ).unit,
                    amount: this.aggregationService.generateDayWithTemporality(
                      getTraderInfosDto.temporality
                    ).amount
                  }
                }
              ]
            }
          }
        ]
      }
    } else {
      matchClause = {
        user: new ObjectId(userId.id)
      }
    }

    //Else, get informations about his trades
    const tradesInformations = await this.tradeUserModel
      .aggregate()
      .match(matchClause)
      .addFields({
        roi: {
          $cond: {
            if: { $eq: ['$side', 'Buy'] },
            then: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$closedPrice', '$entryPrice'] },
                    '$entryPrice'
                  ]
                },
                100
              ]
            },
            else: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$entryPrice', '$closedPrice'] },
                    '$closedPrice'
                  ]
                },
                100
              ]
            }
          }
        }
      })
      .group({
        _id: '$user',
        openTrades: {
          $push: { $cond: [{ $eq: ['$isOpen', true] }, '$$ROOT', '$$REMOVE'] }
        },
        closedTrades: {
          $push: { $cond: [{ $eq: ['$isOpen', false] }, '$$ROOT', '$$REMOVE'] }
        },
        count: { $sum: 1 },
        won: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $and: [
                      { $eq: ['$isOpen', false] },
                      { $eq: ['$side', 'Buy'] },
                      { $gt: ['$closedPrice', '$entryPrice'] }
                    ]
                  },
                  {
                    $and: [
                      { $eq: ['$isOpen', false] },
                      { $eq: ['$side', 'Sell'] },
                      { $gt: ['$entryPrice', '$closedPrice'] }
                    ]
                  }
                ]
              },
              then: 1,
              else: 0
            }
          }
        },
        lost: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $and: [
                      { $eq: ['$side', 'Buy'] },
                      { $gt: ['$entryPrice', '$closedPrice'] }
                    ]
                  },
                  {
                    $and: [
                      { $eq: ['$side', 'Sell'] },
                      { $gt: ['$closedPrice', '$entryPrice'] }
                    ]
                  }
                ]
              },
              then: 1,
              else: 0
            }
          }
        },
        trades: {
          $push: '$$ROOT._id'
        },
        nbOpenTrades: {
          $sum: { $cond: { if: { $eq: ['$isOpen', true] }, then: 1, else: 0 } }
        },
        avgRoiClosedTrade: { $avg: '$roi' }
      })

    //If the result is empty, the trader has no trades
    if (!tradesInformations || tradesInformations.length === 0) {
      return {
        avgRoiClosedTrade: 0,
        avgRoiOpenTrades: 0,
        nbOfTrades: 0,
        nbOpenTrades: 0,
        trades: [],
        winRate: undefined
      }
    }

    const tradesInformationsResult = tradesInformations[0]

    let client
    try {
      client = await this.ccxtService.getClient('bybit')
    } catch (error) {
      console.log('Error with Bybit API')
      console.log(error)
      client = undefined
    }

    const pairs = await this.pairModel.find()

    const pairsInfos = await client.fetchTickers()

    const actualPrices = await pairs.reduce(
      async (previousValue, currentValue) => {
        let currentPairPrice = undefined

        if (client) {
          currentPairPrice = this.aggregationService.getLastPriceOfSymbol(
            pairsInfos,
            currentValue.title
          )
        }

        return {
          ...(await previousValue),
          [currentValue._id.toString()]: currentPairPrice
        }
      },
      {}
    )

    const rois = tradesInformationsResult['openTrades'].map((elmt) => {
      if (elmt.side === 'Buy') {
        return (
          ((actualPrices[elmt.symbol.toString()] - elmt.entryPrice) /
            elmt.entryPrice) *
          100 *
          elmt.leverage
        )
      } else {
        return (
          ((elmt.entryPrice - actualPrices[elmt.symbol.toString()]) /
            actualPrices[elmt.symbol.toString()]) *
          100 *
          elmt.leverage
        )
      }
    })

    const avgRoiOpenTrades =
      rois.reduce((previousValue, currentValue) => {
        return previousValue + currentValue
      }, 0) / rois.length

    const finalResult = {
      nbOfTrades: tradesInformationsResult.count,
      avgRoiClosedTrades: tradesInformationsResult.avgRoiClosedTrade,
      avgRoiOpenTrades: avgRoiOpenTrades,
      nbOpenTrades: tradesInformationsResult.nbOpenTrades,
      trades: tradesInformationsResult.trades,
      winRate:
        (tradesInformationsResult.won /
          (tradesInformationsResult.count -
            tradesInformationsResult.nbOpenTrades)) *
        100
    }

    return finalResult
  }

  async getUserTradesDetails(getTradesDetailsDto: GetTradesDetailsDto) {
    const steps = [
      {
        $project: {
          pair: '$symbol',
          user: 1,
          side: 1,
          size: 1,
          leverage: 1,
          duration: {
            $cond: {
              if: { $eq: ['$isOpen', true] },
              then: {
                $divide: [{ $subtract: ['$$NOW', '$startedDate'] }, 1000 * 60]
              },
              else: {
                $divide: [
                  { $subtract: ['$closedDate', '$startedDate'] },
                  1000 * 60
                ]
              }
            }
          },
          roi: {
            $cond: {
              if: { $eq: ['$side', 'Buy'] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$closedPrice', '$entryPrice'] },
                      '$entryPrice'
                    ]
                  },
                  100
                ]
              },
              else: {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$entryPrice', '$closedPrice'] },
                      '$closedPrice'
                    ]
                  },
                  100
                ]
              }
            }
          },
          isOpen: 1,
          startedDate: 1,
          closedDate: 1,
          entryPrice: 1,
          closedPrice: 1,
          associatedTrade: 1
        }
      },
      {
        $lookup: {
          from: 'pairs',
          localField: 'pair',
          foreignField: '_id',
          as: 'pair'
        }
      },
      {
        $unwind: {
          path: '$pair'
        }
      },
      {
        $lookup: {
          from: 'users',
          pipeline: [{ $project: { _id: 1, username: 1, traders: 1 } }],
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user'
        }
      },
      {
        $lookup: {
          from: 'trades',
          localField: 'associatedTrade',
          foreignField: '_id',
          as: 'associatedTradeObject'
        }
      },
      {
        $unwind: {
          path: '$associatedTradeObject'
        }
      },
      {
        $addFields: {
          trader: '$associatedTradeObject.trader'
        }
      },
      { $unset: 'associatedTradeObject' },
      {
        $lookup: {
          from: 'traders',
          localField: 'trader',
          foreignField: '_id',
          as: 'trader'
        }
      },
      {
        $unwind: {
          path: '$trader'
        }
      }
    ]

    const openTrades = await this.tradeUserModel.aggregate([
      {
        $match: {
          _id: {
            $in: getTradesDetailsDto.trades.map((elmt) => new ObjectId(elmt))
          },
          isOpen: true
        }
      },
      {
        $sort: {
          startedDate: -1
        }
      },
      ...steps
    ])

    let client
    try {
      client = await this.ccxtService.getClient('bybit')
    } catch (error) {
      console.log('Error with Bybit API')
      console.log(error)
      client = undefined
    }

    const pairs = await this.pairModel.find()

    const pairsInfos = await client.fetchTickers()

    const actualPrices = await pairs.reduce(
      async (previousValue, currentValue) => {
        let currentPairPrice = undefined

        if (client) {
          currentPairPrice = this.aggregationService.getLastPriceOfSymbol(
            pairsInfos,
            currentValue.title
          )
        }

        return {
          ...(await previousValue),
          [currentValue._id.toString()]: currentPairPrice
        }
      },
      {}
    )

    const openTradesFinal = await openTrades.reduce(
      async (previousValue, currentValue) => {
        let roi
        if (currentValue.side === 'Buy') {
          roi =
            ((actualPrices[currentValue.pair._id.toString()] -
              currentValue.entryPrice) /
              currentValue.entryPrice) *
            100 *
            currentValue.leverage
        } else {
          roi =
            ((currentValue.entryPrice -
              actualPrices[currentValue.pair._id.toString()]) /
              actualPrices[currentValue.pair._id.toString()]) *
            100 *
            currentValue.leverage
        }

        return [
          ...(await previousValue),
          {
            ...currentValue,
            roi: roi
          }
        ]
      },
      []
    )

    const closedTrades = await this.tradeUserModel.aggregate([
      {
        $match: {
          _id: {
            $in: getTradesDetailsDto.trades.map((elmt) => new ObjectId(elmt))
          },
          isOpen: false
        }
      },
      {
        $sort: {
          closedDate: -1
        }
      },
      ...steps
    ])

    return {
      open: openTradesFinal,
      closed: closedTrades
    }
  }

  async getLastTrades(
    userId: IdParam,
    getTraderLastTradesDto: GetTraderLastTradesDto
  ) {
    const aggregResult = await this.tradeUserModel.aggregate([
      {
        $match: {
          user: new ObjectId(userId.id)
        }
      },
      {
        $sort: {
          startedDate: -1
        }
      },
      {
        $limit: getTraderLastTradesDto.numberOfTrades
      },
      {
        $group: {
          _id: null,
          trades: {
            $push: '$$ROOT._id'
          }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ])

    if (aggregResult && aggregResult.length > 0) {
      return aggregResult[0]
    } else {
      return {
        trades: []
      }
    }
  }

  async getLastUserTradesDetails(userId: IdParam) {
    const tradesList = await this.getLastTrades(userId, {
      numberOfTrades: 200
    })

    const finalTradesList = tradesList.trades.map((element) =>
      element.toString()
    )

    return await this.getUserTradesDetails({ trades: finalTradesList })
  }

  async closeUserTrade(userId: IdParam, closeTradeDto: CloseTradeDto) {
    const user = await this.userModel.findOne({ _id: new ObjectId(userId.id) })

    const userTrade: TradeUserDocument = await this.tradeUserModel
      .findOne({
        _id: new ObjectId(closeTradeDto.tradeId),
        user: new ObjectId(userId.id)
      })
      .populate('symbol')

    let newSide
    if (userTrade.side === 'Buy') {
      newSide = 'Sell'
    } else {
      newSide = 'Buy'
    }

    if (!userTrade) {
      return new NotFoundException('Trade not found')
    }

    const client = await this.aggregationService.getClient(
      user.apiKey,
      user.apiSecret
    )

    const order = await client.createOrder(
      userTrade.symbol.title,
      'Market',
      newSide,
      userTrade.size,
      undefined,
      {
        timeInForce: 'FOK',
        reduceOnly: true
      }
    )

    this.saveLastExecPrice(
      order.info.order_id,
      userTrade.symbol.title,
      client,
      userTrade
    )

    if (order) {
      userTrade.isOpen = false
      userTrade.closedDate = new Date()

      await this.tradeUserModel.findOneAndUpdate(
        { _id: new ObjectId(userTrade._id) },
        { $set: userTrade },
        { upsert: true }
      )
    } else {
      return new ConflictException(
        'ERROR - Impossible to close the bybit trade'
      )
    }

    return user
  }

  async saveLastExecPrice(
    orderId: string,
    symbol: string,
    client: Exchange,
    userTrade: TradeUserDocument
  ) {
    let found = false
    let recorded_order

    while (!found) {
      try {
        recorded_order = await client.fetchOrder(orderId, symbol)
        found = true
      } catch (error) {
        found = false
      }

      if (found) {
        userTrade.closedPrice = recorded_order.info.last_exec_price

        await this.tradeUserModel.findOneAndUpdate(
          { _id: new ObjectId(userTrade._id) },
          { $set: userTrade },
          { upsert: true }
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
