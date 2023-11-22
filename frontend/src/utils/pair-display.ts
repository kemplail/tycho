export function displayPair(pair: string): string {
  const index = pair.length - 4
  return `${pair.slice(0, index)} ${pair.slice(index, pair.length)}`
}
