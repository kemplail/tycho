import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IdParam } from '../models/IdParams'
import { UpdateTraderDto } from '../models/traders/update-trader.dto'
import { CreateTraderDto } from '../models/traders/create-trader.dto'
import { Trader, TraderDocument } from '../models/traders/trader.schema'
import { Trade, TradeDocument } from '../models/trades/trade.schema'
import { ObjectId } from 'mongodb'
import { GetTraderClassementDto } from '../models/traders/get-trader-classement.dto'
import { AggregationService } from './aggregation.service'
import { FilterTraderClassementEnum } from '../models/filters/filter-trader-classement.enum'
import { GetTraderLastTradesDto } from '../models/traders/get-trader-last-trades.dto'
import { CcxtService } from 'nestjs-ccxt'
import { Pair, PairDocument } from '../models/pairs/pair.schema'
import { GetTraderInfosDto } from '../models/traders/get-trader-infos.dto'
import { TradeService } from './trade.service'
import { TraderDeletedEvent } from '../events/TraderDeletedEvent'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class TraderService {
  constructor(
    @InjectModel(Trader.name) private traderModel: Model<TraderDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    private aggregationService: AggregationService,
    private tradeService: TradeService,
    private ccxtService: CcxtService,
    private eventEmitter: EventEmitter2,
    @InjectModel(Pair.name) private pairModel: Model<PairDocument>
  ) {}

  async create(createTraderDto: CreateTraderDto) {
    const traderInDatabase = await this.traderModel.findOne({
      leaderMark: createTraderDto.leaderMark
    })

    if (traderInDatabase) {
      return new ConflictException('The trader already exists')
    }

    const traderToCreate = new this.traderModel({
      ...createTraderDto,
      addedDate: new Date()
    }).save()

    return traderToCreate
  }

  async delete(traderId: IdParam) {
    const deletedTrader = await this.traderModel.findByIdAndDelete(traderId.id)

    const traderDeletedEvent = new TraderDeletedEvent()
    traderDeletedEvent._id = deletedTrader._id.toString()
    this.eventEmitter.emit('trader.deleted', traderDeletedEvent)
  }

  async update(traderId: IdParam, updateTraderDto: UpdateTraderDto) {
    return this.traderModel.findByIdAndUpdate(traderId.id, updateTraderDto)
  }

  async getATrader(traderId: IdParam) {
    return await this.traderModel.findOne({
      _id: new ObjectId(traderId.id)
    })
  }

  async getAll() {
    return await this.traderModel.find()
  }

  async getTraderInfos(
    traderId: IdParam,
    getTraderInfosDto: GetTraderInfosDto
  ) {
    //Check if the trader exists
    const trader = await this.traderModel.findOne({
      _id: new ObjectId(traderId.id)
    })
    //If not, return an exception
    if (!trader) {
      return new NotFoundException('Trader not found')
    }

    let matchClause

    if (getTraderInfosDto.temporality !== 'ALWAYS') {
      matchClause = {
        $and: [
          { trader: new ObjectId(traderId.id) },
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
        trader: new ObjectId(traderId.id)
      }
    }

    //Else, get informations about his trades
    const tradesInformations = await this.tradeModel
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
        _id: '$trader',
        openTrades: {
          $push: { $cond: [{ $eq: ['$isOpen', true] }, '$$ROOT', '$$REMOVE'] }
        },
        closedTrades: {
          $push: { $cond: [{ $eq: ['$isOpen', false] }, '$$ROOT', '$$REMOVE'] }
        },
        cumProfit: { $sum: '$orderNetProfit' },
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

    const pairRepartition = await this.tradeModel.aggregate([
      {
        $match: matchClause
      },
      {
        $group: {
          _id: '$symbol',
          count: {
            $sum: 1
          }
        }
      },
      {
        $lookup: {
          from: 'pairs',
          localField: '_id',
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
        $project: {
          _id: 0
        }
      }
    ])

    //If the result is empty, the trader has no trades
    if (!tradesInformations || tradesInformations.length === 0) {
      return {
        avgProfit: 0,
        avgRoiClosedTrade: 0,
        avgRoiOpenTrades: 0,
        nbOfTrades: 0,
        nbOpenTrades: 0,
        cumProfit: 0,
        trades: [],
        winRate: undefined,
        proportion: undefined
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
      avgProfit:
        tradesInformationsResult.cumProfit !== 0
          ? tradesInformationsResult.cumProfit /
            (tradesInformationsResult.count -
              tradesInformationsResult.nbOpenTrades)
          : 0,
      nbOfTrades: tradesInformationsResult.count,
      avgRoiClosedTrades: tradesInformationsResult.avgRoiClosedTrade,
      avgRoiOpenTrades: avgRoiOpenTrades,
      nbOpenTrades: tradesInformationsResult.nbOpenTrades,
      trades: tradesInformationsResult.trades,
      cumProfit: tradesInformationsResult.cumProfit,
      winRate:
        (tradesInformationsResult.won /
          (tradesInformationsResult.count -
            tradesInformationsResult.nbOpenTrades)) *
        100,
      proportion: pairRepartition
    }

    return finalResult
  }

  async getTraderClassement(getTraderClassementDto: GetTraderClassementDto) {
    let matchClause = undefined

    // const traders = await this.traderModel.find()

    if (getTraderClassementDto.temporality !== 'ALWAYS') {
      matchClause = {
        $match: {
          isOpen: false,
          $expr: {
            $gt: [
              '$startedDate',
              {
                $dateSubtract: {
                  startDate: '$$NOW',
                  unit: this.aggregationService.generateDayWithTemporality(
                    getTraderClassementDto.temporality
                  ).unit,
                  amount: this.aggregationService.generateDayWithTemporality(
                    getTraderClassementDto.temporality
                  ).amount
                }
              }
            ]
          }
        }
      }
    } else {
      matchClause = {
        $match: {
          isOpen: false
        }
      }
    }

    let groupClause = {}
    let projectClause = {}
    let field = ''

    switch (getTraderClassementDto.type) {
      case FilterTraderClassementEnum.BEST_CUM_PROFIT:
        field = 'cumProfit'
        groupClause = {
          $group: {
            _id: '$trader',
            cumProfit: { $sum: '$orderNetProfit' }
          }
        }
        break
      case FilterTraderClassementEnum.BEST_AVG_PROFIT:
        groupClause = {
          $group: {
            _id: '$trader',
            count: { $sum: 1 },
            cumProfit: { $sum: '$orderNetProfit' }
          }
        }
        projectClause = {
          $project: {
            avgProfit: { $divide: ['$cumProfit', '$count'] }
          }
        }
        field = 'avgProfit'
        break
      case FilterTraderClassementEnum.BEST_WINRATE:
        groupClause = {
          $group: {
            _id: '$trader',
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
            }
          }
        }
        projectClause = {
          $project: {
            winRate: { $multiply: [{ $divide: ['$won', '$count'] }, 100] }
          }
        }
        field = 'winRate'
        break
    }

    const steps = [matchClause, groupClause]
    if (
      getTraderClassementDto.type !== FilterTraderClassementEnum.BEST_CUM_PROFIT
    ) {
      steps.push(projectClause)
    }

    steps.push(
      ...[
        {
          $lookup: {
            from: 'traders',
            localField: '_id',
            foreignField: '_id',
            as: 'trader'
          }
        },
        {
          $unwind: {
            path: '$trader'
          }
        },
        {
          $project: {
            _id: 0
          }
        },
        {
          $sort: {
            [field]: -1,
            'trader.name': 1
          }
        }
      ]
    )

    const result = await this.tradeModel.aggregate(steps)

    // traders.forEach((trader) => {
    //   if (
    //     result.filter(
    //       (elmt) => elmt.trader._id.toString() === trader._id.toString()
    //     ).length === 0
    //   ) {
    //     if (field === 'cumProfit') {
    //       result.push({ [field]: 0, trader: trader })
    //     } else {
    //       result.push({ [field]: undefined, trader: trader })
    //     }
    //   }
    // })

    return result
  }

  async getLastTrades(
    traderId: IdParam,
    getTraderLastTradesDto: GetTraderLastTradesDto
  ) {
    const aggregResult = await this.tradeModel.aggregate([
      {
        $match: {
          trader: new ObjectId(traderId.id)
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

  async getLastTradesDetails(traderId: IdParam) {
    const tradesList = await this.getLastTrades(traderId, {
      numberOfTrades: 500
    })

    const finalTradesList = tradesList.trades.map((element) =>
      element.toString()
    )

    return await this.tradeService.getTradesDetails({ trades: finalTradesList })
  }
}
