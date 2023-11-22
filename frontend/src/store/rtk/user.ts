import { TraderRankingTemporality } from 'src/types/enum/trader-ranking-temporality.enum'
import { CloseTradeInput } from 'src/types/interfaces/close-trade-input'
import { TradesDetailsOutput } from 'src/types/interfaces/trades-details-output'
import { UserBybitInformationsOutput } from 'src/types/interfaces/user-bybit-informations-output'
import { UserInformationsOutput } from 'src/types/interfaces/user-informations-output'
import { User } from 'src/types/interfaces/user.interface'
import { rtkApi } from '.'

export const userApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    loggedUser: builder.query<User, void>({
      query: () => ({
        url: 'auth/loggedUser',
        method: 'GET'
      }),
      providesTags: ['User']
    }),
    setTraders: builder.mutation<User, { traders: string[] }>({
      query: (body) => ({
        url: 'users/set-traders',
        method: 'POST',
        data: body
      }),
      invalidatesTags: ['User']
    }),
    setCloseTrade: builder.mutation<User, CloseTradeInput>({
      query: (body) => ({
        url: 'users/close-trade',
        method: 'POST',
        data: body
      }),
      invalidatesTags: ['User']
    }),
    getUserInformations: builder.query<
      UserInformationsOutput,
      { temporality: TraderRankingTemporality }
    >({
      query: (body) => ({
        url: 'users/user-informations',
        method: 'POST',
        data: body
      }),
      providesTags: ['User']
    }),
    getUserBybitInformations: builder.query<UserBybitInformationsOutput, void>({
      query: () => ({
        url: 'users/bybit-informations',
        method: 'POST'
      }),
      providesTags: ['User']
    }),
    getUserLastTradesDetails: builder.query<TradesDetailsOutput, void>({
      query: () => ({
        url: 'users/last-trades-details',
        method: 'POST'
      }),
      providesTags: ['User']
    })
  })
})

export const {
  useLoggedUserQuery,
  useSetTradersMutation,
  useGetUserInformationsQuery,
  useGetUserBybitInformationsQuery,
  useGetUserLastTradesDetailsQuery,
  useSetCloseTradeMutation
} = userApi
