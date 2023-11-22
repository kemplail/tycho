import { useState } from 'react'

export function usePagination<T>(data?: T[], itemsPerPage = 5) {
  const [skip, setSkip] = useState(0)

  if (!data) {
    return {
      hasPrevious: false,
      previousPage: () => {},
      hasNext: false,
      nextPage: () => {},
      data: undefined,
      from: undefined,
      to: undefined
    }
  }

  const end = skip + itemsPerPage

  const hasPrevious = skip > 0
  const hasNext = end < data.length

  const previousPage = () => {
    setSkip(skip - itemsPerPage)
  }

  const nextPage = () => {
    setSkip(end)
  }

  return {
    hasPrevious,
    previousPage,
    hasNext,
    nextPage,
    data: data.slice(skip, end),
    from: data.length === 0 ? 0 : skip + 1,
    to: end > data.length ? data.length : end
  }
}
