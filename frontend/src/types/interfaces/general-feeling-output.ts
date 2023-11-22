export interface GeneralFeelingOutput {
  generalInformations: {
    nbOfShorts: number
    nbOfLongs: number
    trades: string[]
    nbOfTraders: number
  }
  proportion?: {
    count: number
    pair: {
      _id: String
      title: String
    }
  }[]
}
