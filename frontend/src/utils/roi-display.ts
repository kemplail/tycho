export const isROIPositive = (ROI: number | undefined) => {
  if (ROI) {
    if (ROI > 0) {
      return true
    } else {
      return false
    }
  }
}
