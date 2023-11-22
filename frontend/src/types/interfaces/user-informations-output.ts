export interface UserInformationsOutput {
  nbOfTrades: number
  nbOpenTrades: number
  avgRoiClosedTrades: number
  avgRoiOpenTrades: number
  trades: string[]
  winRate?: number
}
