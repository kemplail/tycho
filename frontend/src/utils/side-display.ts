import { Side } from 'src/types/enum/side.enum'

export const sideDisplay = (side: Side) => {
  switch (side) {
    case 'Buy':
      return 'Long'
    case 'Sell':
      return 'Short'
  }
}
