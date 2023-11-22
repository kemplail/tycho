import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { CcxtService } from 'nestjs-ccxt'

@Injectable()
export class AggregationService {
  constructor(private ccxtService: CcxtService) {}

  generateDayWithTemporality(
    temporality:
      | 'LAST_THIRTY_MINUTES'
      | 'LAST_HOUR'
      | 'LAST_DAY'
      | 'LAST_FOUR_HOURS'
      | 'LAST_TWELVE_HOURS'
      | 'LAST_SEVEN_DAYS'
      | 'LAST_FOURTEEN_DAYS'
      | 'LAST_MONTH'
  ) {
    switch (temporality) {
      case 'LAST_THIRTY_MINUTES':
        return {
          unit: 'minute',
          amount: 30
        }
      case 'LAST_HOUR':
        return {
          unit: 'hour',
          amount: 1
        }
      case 'LAST_FOUR_HOURS':
        return {
          unit: 'hour',
          amount: 4
        }
      case 'LAST_TWELVE_HOURS':
        return {
          unit: 'hour',
          amount: 12
        }
      case 'LAST_DAY':
        return {
          unit: 'day',
          amount: 1
        }
      case 'LAST_SEVEN_DAYS':
        return {
          unit: 'day',
          amount: 7
        }
      case 'LAST_FOURTEEN_DAYS':
        return {
          unit: 'day',
          amount: 14
        }
      case 'LAST_MONTH':
        return {
          unit: 'day',
          amount: 30
        }
    }
  }

  getLastPriceOfSymbol = (
    data: {
      info: { symbol: string; last_price: number }
    }[],
    symbol: string
  ) => {
    let found = false
    const keys = Object.keys(data)

    let i = 0
    let lastPrice = null

    while (!found && i < keys.length - 1) {
      if (data[keys[i]].info.symbol == symbol) {
        lastPrice = data[keys[i]].info.last_price
        found = true
      }
      i++
    }

    return lastPrice
  }

  async getClient(apiKey, secret) {
    let client
    try {
      client = await this.ccxtService.getClient('bybit', {
        apiKey: apiKey,
        secret: secret
      })
      client.set_sandbox_mode(true)
    } catch (error) {
      console.log('Error with Bybit API')
      console.log(error)
      return new ServiceUnavailableException(
        'Impossible to connect with Bybit API'
      )
    }

    return client
  }
}
