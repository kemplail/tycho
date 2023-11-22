import { ApiProperty } from '@nestjs/swagger'
import { Pair } from '../pairs/pair.schema'

export class GetTraderInfosOutput {
  @ApiProperty({
    example: {
      value: 5
    },
    description: 'Number of finished trades of the trader'
  })
  nbOfTrades: number
  @ApiProperty({
    example: {
      value: 112.7
    },
    description: 'Cumulated profit of the trader'
  })
  cumProfit: number
  @ApiProperty({
    example: {
      value: 2.4
    },
    description: 'Average profit of the trader'
  })
  avgProfit: number
  @ApiProperty({
    example: {
      value: 78
    },
    description: 'winRate of the trader',
    required: false
  })
  winRate?: number
  proportion?: {
    pair: Pair
    proportion: number
  }[]
}
