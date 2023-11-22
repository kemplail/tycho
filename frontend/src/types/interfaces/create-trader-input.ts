import { Trader } from './trader.interface'

export type CreateTraderInput = Pick<Trader, 'name' | 'note' | 'leaderMark'>
