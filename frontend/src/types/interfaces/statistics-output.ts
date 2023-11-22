import { Side } from '../enum/side.enum'

export interface StatisticsOutput {
  [pairId: string]: StatisticsOutputElement
}

export type StatisticsOutputElement = {
  nbOfTrades: number
  nbOfShorts: number
  nbOfLongs: number
  trades: string[]
  avgQty: number
  cumQty: number
  won?: number
  lost?: number
  avgProfit?: number
  cumProfit?: number
  avgRoi?: number
  lastClosedDate?: number
  lastStartedDate?: number
  avgLeverage: number
  avgDuration: number
  nbOfTraders: number
  pair: Pair
  details?: StatisticsOuputDetails
}

export type StatisticsOuputDetails = {
  [side in Side]?: {
    _id: {
      pair: string
      side: Side
    }
    tp: {
      minTp: number
      maxTp: number
      avgTp: number
    }
    sl: {
      minSl: number
      maxSl: number
      avgSl: number
    }
    entryPrice: {
      minEntryPrice: number
      maxEntryPrice: number
      avgEntryPrice: number
    }
    roi: {
      maxRoi: number
      minRoi: number
      avgRoi: number
    }
  }
}

export interface Pair {
  _id: string
  title: string
}
