import { Body, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ObjectId } from 'mongodb'
import { GeneralFiltersDto } from '../models/trades/get-general-filters.dto'
import { Trader, TraderDocument } from '../models/traders/trader.schema'
import { Trade, TradeDocument } from '../models/trades/trade.schema'
import { AggregationService } from './aggregation.service'
import { GetTradesDetailsDto } from '../models/trades/get-trades-details.dto'
import { Pair, PairDocument } from '../models/pairs/pair.schema'
import { CcxtService } from 'nestjs-ccxt'

@Injectable()
export class TradeService {
  constructor(
    @InjectModel(Trader.name) private traderModel: Model<TraderDocument>,
    @InjectModel(Trade.name) private tradeModel: Model<TradeDocument>,
    @InjectModel(Pair.name) private pairModel: Model<PairDocument>,
    private aggregationService: AggregationService,
    private ccxtService: CcxtService
  ) {}

  async getGeneralFeeling(@Body() getGeneralFeelingDto: GeneralFiltersDto) {
    const tradeStatus = getGeneralFeelingDto.tradeStatus === 'OPEN'
    const steps = []

    let matchClause = {}

    if (getGeneralFeelingDto.type === 'TEMPORALITY') {
      const temporality = this.aggregationService.generateDayWithTemporality(
        getGeneralFeelingDto.temporality
      )

      matchClause = {
        $match: {
          $and: [
            { isOpen: tradeStatus },
            {
              $expr: {
                $gt: [
                  '$startedDate',
                  {
                    $dateSubtract: {
                      startDate: '$$NOW',
                      unit: temporality.unit,
                      amount: temporality.amount
                    }
                  }
                ]
              }
            }
          ]
        }
      }

      steps.push(matchClause)
    } else {
      matchClause = {
        $match: { isOpen: tradeStatus }
      }

      const sortClause = {
        $sort: {
          startedDate: -1
        }
      }
      const limitClause = {
        $limit: getGeneralFeelingDto.numberOfTrades
      }

      steps.push(...[matchClause, sortClause, limitClause])
    }

    const principalInformationsSteps = [
      {
        $group: {
          _id: null,
          nbOfShorts: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$side', 'Sell']
                },
                then: 1,
                else: 0
              }
            }
          },
          nbOfLongs: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$side', 'Buy']
                },
                then: 1,
                else: 0
              }
            }
          },
          totalTraders: {
            $addToSet: '$trader'
          },
          trades: {
            $push: '$$ROOT._id'
          }
        }
      },
      {
        $project: {
          _id: 0,
          nbOfTraders: { $size: '$totalTraders' },
          nbOfShorts: 1,
          nbOfLongs: 1,
          trades: 1
        }
      }
    ]

    const pairRepartitionSteps = [
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
    ]

    const principalInfosResult = await this.tradeModel.aggregate([
      ...steps,
      ...principalInformationsSteps
    ])
    const pairRepartitionResult = await this.tradeModel.aggregate([
      ...steps,
      ...pairRepartitionSteps
    ])

    if (!principalInfosResult || principalInfosResult.length === 0) {
      return {
        generalInformations: {
          nbOfShorts: 0,
          nbOfLongs: 0,
          nbOfTraders: 0,
          trades: []
        },
        proportion: undefined
      }
    }

    const principalInfosResultFinal = principalInfosResult[0]

    const result = {
      generalInformations: principalInfosResultFinal,
      proportion: []
    }

    pairRepartitionResult.forEach((element) => {
      result.proportion.push(element)
    })

    return result
  }

  async getStatistics(getStatisticsDto: GeneralFiltersDto) {
    const tradeStatus = getStatisticsDto.tradeStatus === 'OPEN'
    const steps = []

    let matchClause = {}

    if (getStatisticsDto.traderId) {
      matchClause = {
        trader: new ObjectId(getStatisticsDto.traderId)
      }
    }

    if (getStatisticsDto.type === 'TEMPORALITY') {
      const temporality = this.aggregationService.generateDayWithTemporality(
        getStatisticsDto.temporality
      )

      matchClause = {
        $match: {
          ...matchClause,
          $and: [
            { isOpen: tradeStatus },
            {
              $expr: {
                $gt: [
                  '$startedDate',
                  {
                    $dateSubtract: {
                      startDate: '$$NOW',
                      unit: temporality.unit,
                      amount: temporality.amount
                    }
                  }
                ]
              }
            }
          ]
        }
      }

      const sortClause = {
        $sort: {
          startedDate: -1
        }
      }

      steps.push(matchClause, sortClause)
    } else {
      matchClause = {
        $match: { ...matchClause, isOpen: tradeStatus }
      }

      const sortClause = {
        $sort: {
          startedDate: -1
        }
      }

      const limitClause = {
        $limit: getStatisticsDto.numberOfTrades
      }

      steps.push(...[matchClause, sortClause, limitClause])
    }

    let result

    const getPairsSteps = [
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
      },
      {
        $sort: {
          'pair._id': 1
        }
      }
    ]

    let finalResult

    if (getStatisticsDto.tradeStatus === 'CLOSED') {
      result = await this.tradeModel.aggregate([
        ...steps,
        {
          $addFields: {
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
          }
        },
        ...[
          {
            $group: {
              _id: '$symbol',
              avgRoi: {
                $avg: '$roi'
              },
              nbOfTrades: { $sum: 1 },
              nbOfShorts: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ['$side', 'Sell']
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              nbOfLongs: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ['$side', 'Buy']
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              won: {
                $sum: {
                  $cond: {
                    // if: { $gt: ['$orderNetProfit', 0] },
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
              cumProfit: { $sum: '$orderNetProfit' },
              cumQty: { $sum: '$size' },
              cumLeverage: { $sum: '$leverage' },
              cumDuration: {
                $sum: {
                  $divide: [
                    { $subtract: ['$closedDate', '$startedDate'] },
                    1000 * 60
                  ]
                }
              },
              trades: {
                $push: '$$ROOT'
              },
              totalTraders: {
                $addToSet: '$trader'
              }
            }
          },
          {
            $project: {
              _id: 1,
              avgRoi: 1,
              nbOfTrades: 1,
              nbOfShorts: 1,
              trades: '$trades._id',
              nbOfLongs: 1,
              won: 1,
              lost: 1,
              avgProfit: { $divide: ['$cumProfit', '$nbOfTrades'] },
              cumProfit: '$cumProfit',
              avgQty: { $divide: ['$cumQty', '$nbOfTrades'] },
              cumQty: '$cumQty',
              avgLeverage: { $divide: ['$cumLeverage', '$nbOfTrades'] },
              avgDuration: { $divide: ['$cumDuration', '$nbOfTrades'] },
              nbOfTraders: { $size: '$totalTraders' },
              lastClosedDate: {
                $getField: {
                  field: 'closedDate',
                  input: { $first: '$trades' }
                }
              }
            }
          },
          ...getPairsSteps
        ]
      ])

      finalResult = result.reduce((previousValue, currentValue) => {
        return {
          ...previousValue,
          [currentValue.pair._id]: currentValue
        }
      }, {})
    } else {
      result = await this.tradeModel.aggregate([
        ...steps,
        ...[
          {
            $group: {
              _id: '$symbol',
              nbOfTrades: { $sum: 1 },
              nbOfShorts: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ['$side', 'Sell']
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              nbOfLongs: {
                $sum: {
                  $cond: {
                    if: {
                      $eq: ['$side', 'Buy']
                    },
                    then: 1,
                    else: 0
                  }
                }
              },
              cumQty: { $sum: '$size' },
              cumLeverage: { $sum: '$leverage' },
              cumDuration: {
                $sum: {
                  $divide: [{ $subtract: ['$$NOW', '$startedDate'] }, 1000 * 60]
                }
              },
              trades: {
                $push: '$$ROOT'
              },
              totalTraders: {
                $addToSet: '$trader'
              }
            }
          },
          {
            $project: {
              _id: 1,
              tradesInDetail: 1,
              nbOfTrades: 1,
              nbOfShorts: 1,
              nbOfLongs: 1,
              trades: '$trades._id',
              avgQty: { $divide: ['$cumQty', '$nbOfTrades'] },
              cumQty: '$cumQty',
              avgLeverage: { $divide: ['$cumLeverage', '$nbOfTrades'] },
              avgDuration: { $divide: ['$cumDuration', '$nbOfTrades'] },
              nbOfTraders: { $size: '$totalTraders' },
              lastStartedDate: {
                $getField: {
                  field: 'startedDate',
                  input: { $first: '$trades' }
                }
              }
            }
          },
          ...getPairsSteps
        ]
      ])

      finalResult = result.reduce((previousValue, currentValue) => {
        return {
          ...previousValue,
          [currentValue.pair._id]: currentValue
        }
      }, {})

      let client
      try {
        client = await this.ccxtService.getClient('bybit')
      } catch (error) {
        console.log('Error with Bybit API')
        console.log(error)
        client = undefined
      }

      const detailsInformations = await this.tradeModel.aggregate([
        ...steps,
        ...[
          {
            $group: {
              _id: {
                pair: '$symbol',
                side: '$side'
              },
              tradesInDetail: {
                $push: '$$ROOT'
              },
              minTp: { $min: '$takeProfitPrice' },
              maxTp: { $max: '$takeProfitPrice' },
              avgTp: { $avg: '$takeProfitPrice' },
              minSl: { $min: '$stopLossPrice' },
              maxSl: { $max: '$stopLossPrice' },
              avgSl: { $avg: '$stopLossPrice' },
              minEntryPrice: { $min: '$entryPrice' },
              maxEntryPrice: { $max: '$entryPrice' },
              avgEntryPrice: { $avg: '$entryPrice' }
            }
          },
          {
            $set: {
              tp: {
                minTp: '$minTp',
                maxTp: '$maxTp',
                avgTp: '$avgTp'
              },
              sl: {
                minSl: '$minSl',
                maxSl: '$maxSl',
                avgSl: '$avgSl'
              },
              entryPrice: {
                minEntryPrice: '$minEntryPrice',
                maxEntryPrice: '$maxEntryPrice',
                avgEntryPrice: '$avgEntryPrice'
              }
            }
          },
          {
            $unset: [
              'minTp',
              'maxTp',
              'avgTp',
              'minSl',
              'maxSl',
              'avgSl',
              'minEntryPrice',
              'maxEntryPrice',
              'avgEntryPrice'
            ]
          },
          {
            $sort: {
              '_id.pair': 1
            }
          }
        ]
      ])

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

      const finalDetails = await detailsInformations.reduce(
        async (previousValue, currentValue) => {
          const tradesInfos = currentValue.tradesInDetail.map((elmt) => ({
            entryPrice: elmt.entryPrice,
            leverage: elmt.leverage,
            side: elmt.side
          }))
          const rois = tradesInfos.map((elmt) => {
            if (elmt.side === 'Buy') {
              return (
                ((actualPrices[currentValue._id.pair.toString()] -
                  elmt.entryPrice) /
                  elmt.entryPrice) *
                100 *
                elmt.leverage
              )
            } else {
              return (
                ((elmt.entryPrice -
                  actualPrices[currentValue._id.pair.toString()]) /
                  actualPrices[currentValue._id.pair.toString()]) *
                100 *
                elmt.leverage
              )
            }
          })

          const avgRoi =
            rois.reduce((previousValue, currentValue) => {
              return previousValue + currentValue
            }, 0) / rois.length

          const maxRoi = Math.max(...rois)
          const minRoi = Math.min(...rois)

          const { tradesInDetail, ...finalCurrentValue } = currentValue

          return [
            ...(await previousValue),
            {
              ...finalCurrentValue,
              roi: {
                maxRoi: maxRoi,
                minRoi: minRoi,
                avgRoi: avgRoi
              }
            }
          ]
        },
        []
      )

      finalDetails.forEach((element) => {
        if (!finalResult[element._id.pair].details) {
          finalResult[element._id.pair].details = {}
        }

        finalResult[element._id.pair].details[element._id.side] = element
      })
    }

    return finalResult
  }

  async getTradesDetails(getTradesDetailsDto: GetTradesDetailsDto) {
    const steps = [
      {
        $project: {
          pair: '$symbol',
          trader: 1,
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
          orderNetProfit: 1,
          entryPrice: 1,
          closedPrice: 1
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

    const openTrades = await this.tradeModel.aggregate([
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

    const closedTrades = await this.tradeModel.aggregate([
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
}
