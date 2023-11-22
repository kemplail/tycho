import { Trader } from './trader.interface'

export interface TraderRanking {
  winRate?: number
  cumProfit?: number
  avgProfit?: number
  trader: Trader
}
