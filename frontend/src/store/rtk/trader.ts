import { TraderRankingTemporality } from 'src/types/enum/trader-ranking-temporality.enum'
import { CreateTraderInput } from 'src/types/interfaces/create-trader-input'
import { TraderInformationsOutput } from 'src/types/interfaces/trader-informations-output'
import { Trader } from 'src/types/interfaces/trader.interface'
import { TradesDetailsOutput } from 'src/types/interfaces/trades-details-output'
import { rtkApi } from '.'

export const traderApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrader: builder.query<Trader, string>({
      query: (id) => ({
        url: `traders/trader-profile/${id}`,
        method: 'POST'
      }),
      providesTags: ['globalInformations']
    }),
    addTrader: builder.mutation<Trader, CreateTraderInput>({
      query: (body) => ({
        url: `traders`,
        method: 'POST',
        data: body
      }),
      invalidatesTags: ['globalInformations']
    }),
    deleteTrader: builder.mutation<Trader, string>({
      query: (id) => ({
        url: `traders/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['globalInformations']
    }),
    updateTrader: builder.mutation<Trader, Trader>({
      query: (trader) => ({
        url: `traders/${trader._id}`,
        method: 'PATCH',
        data: trader
      }),
      invalidatesTags: ['globalInformations']
    }),
    getAllTraders: builder.query<Trader[], void>({
      query: () => ({
        url: 'traders',
        method: 'GET'
      }),
      providesTags: ['globalInformations']
    }),
    getTraderInformations: builder.query<
      TraderInformationsOutput,
      { id: string; temporality: TraderRankingTemporality }
    >({
      query: (body) => ({
        url: `traders/informations/${body.id}`,
        method: 'POST',
        data: { temporality: body.temporality }
      }),
      providesTags: ['globalInformations']
    }),
    getTraderLastTradesDetails: builder.query<TradesDetailsOutput, string>({
      query: (id) => ({
        url: `/traders/last-trades-details/${id}`,
        method: 'GET'
      }),
      providesTags: ['globalInformations']
    })
  })
})

export const {
  useGetTraderQuery,
  useDeleteTraderMutation,
  useGetTraderInformationsQuery,
  useUpdateTraderMutation,
  useGetAllTradersQuery,
  useGetTraderLastTradesDetailsQuery,
  useAddTraderMutation
} = traderApi
