import { Trader } from './trader.interface'

export interface User {
  _id: string
  username: string
  traders: Trader[]
  apiKey: string
  apiSecret: string
}
