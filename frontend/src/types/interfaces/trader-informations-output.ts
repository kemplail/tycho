export interface TraderInformationsOutput {
  avgProfit: number
  nbOfTrades: number
  nbOpenTrades: number
  cumProfit: number
  avgRoiClosedTrades: number
  avgRoiOpenTrades: number
  trades: string[]
  winRate?: number
  proportion?: [
    {
      count: number
      pair: {
        _id: String
        title: String
      }
    }
  ]
}
