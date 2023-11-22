import { useEffect, useState } from 'react'
import { Button } from 'src/elements/Button'
import { NoAvailableData } from 'src/elements/NoAvailableData'
import { usePagination } from 'src/hooks/usePagination'
import { useGetAllTradersQuery } from 'src/store/rtk/trader'
import { useLoggedUserQuery, useSetTradersMutation } from 'src/store/rtk/user'

type UserTraders = {}

export const UserTraders: React.FC<UserTraders> = () => {
  const { data: allTraders, isFetching: allTradersIsFetching } =
    useGetAllTradersQuery()

  const {
    data: paginatedData,
    from,
    to,
    hasPrevious,
    previousPage,
    hasNext,
    nextPage
  } = usePagination(allTraders)

  const { data: user, isFetching: userIsFetching } = useLoggedUserQuery()

  const [newTraders, setNewTraders] = useState<string[]>([])

  useEffect(() => {
    if (user?.traders) {
      setNewTraders(user.traders.map((element) => element._id.toString()))
    }
  }, [user])

  const [setTraders] = useSetTradersMutation()

  function handleChange(id: string) {
    const isTraderAlreadyChosed = newTraders.find((element) => element === id)

    if (isTraderAlreadyChosed) {
      setTraders({
        traders: [...newTraders.filter((element) => element !== id)]
      })
    } else {
      setTraders({ traders: [...newTraders, id] })
    }
  }

  return allTraders && user ? (
    <div className="overflow-x-auto relative flex-1 h-full flex flex-col justify-between">
      <table className="w-full text-sm text-left mt-4 mb-4 table-fixed">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 ">
          <tr>
            <th scope="col" className="py-3">
              Name
            </th>
            <th scope="col" className="py-3 text-right">
              Selection
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData &&
            paginatedData.map((element, index) => {
              return (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={element.name}
                >
                  <th
                    scope="row"
                    className="py-4 font-medium whitespace-nowrap"
                  >
                    <a href={`/trader/${element._id}`}>{element.name}</a>
                  </th>
                  <td className="py-4">
                    <div className="flex space-x-2 ml-auto w-min">
                      <input
                        type="checkbox"
                        checked={newTraders.includes(element._id.toString())}
                        onChange={() => handleChange(element._id)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <div className="flex justify-between items-end">
        <small>
          <strong>{from}</strong> à <strong>{to}</strong> sur{' '}
          <strong>{allTraders.length}</strong> résultats
        </small>
        <div className="space-x-2">
          <Button disabled={!hasPrevious} onClick={previousPage}>
            {'<< Précédent'}
          </Button>
          <Button disabled={!hasNext} onClick={nextPage}>
            {'Suivant >>'}
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <NoAvailableData />
  )
}
