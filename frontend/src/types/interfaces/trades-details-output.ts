import { Side } from '../enum/side.enum'
import { Pair } from './statistics-output'
import { Trader } from './trader.interface'
import { User } from './user.interface'

export interface TradesDetailsOutput {
  open?: OpenTrade[]
  closed?: ClosedTrade[]
}

export interface OpenTrade {
  _id: string
  startedDate: Date
  isOpen: boolean
  leverage: number
  trader?: Trader
  user?: User
  size: number
  side: Side
  entryPrice: number
  pair: Pair
  duration: number
  roi: number
}

export interface ClosedTrade {
  _id: string
  startedDate: Date
  isOpen: boolean
  leverage: number
  trader?: Trader
  user?: User
  size: number
  side: Side
  entryPrice: number
  pair: Pair
  duration: number
  roi: number
  closedDate: Date
  closedPrice: number
  orderNetProfit: number
}
