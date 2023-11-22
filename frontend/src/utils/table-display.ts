import {
  ClosedTrade,
  OpenTrade
} from 'src/types/interfaces/trades-details-output'

export const isAboutUser = (data: OpenTrade[] | ClosedTrade[]) => {
  if (data && data.length > 0) {
    return data[0].user && data[0].trader
  } else {
    return false
  }
}
