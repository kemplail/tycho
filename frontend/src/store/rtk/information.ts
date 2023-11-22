import { GeneralFeelingOutput } from '../../types/interfaces/general-feeling-output'
import { GeneralFeelingInput } from '../../types/interfaces/general-feeling-input'
import { rtkApi } from '.'
import { TraderRankingTemporality } from '../../types/enum/trader-ranking-temporality.enum'
import { TraderRankingType } from '../../types/enum/trader-ranking-type.enum'
import { TraderRanking } from '../../types/interfaces/trader-ranking'
import { StatisticsOutput } from 'src/types/interfaces/statistics-output'
import { StatisticsInput } from 'src/types/interfaces/statistics-input'
import { TradesDetailsOutput } from 'src/types/interfaces/trades-details-output'

export const informationsCenterApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getTradersRanking: builder.query<
      TraderRanking[],
      { type: TraderRankingType; temporality: TraderRankingTemporality }
    >({
      query: (body) => ({
        url: 'traders/classement',
        method: 'POST',
        data: body
      }),
      providesTags: ['globalInformations']
    }),
    getGeneralFeeling: builder.query<GeneralFeelingOutput, GeneralFeelingInput>(
      {
        query: (body) => ({
          url: '/trades/general-feeling',
          method: 'POST',
          data: body
        }),
        providesTags: ['globalInformations']
      }
    ),
    getStatistics: builder.query<StatisticsOutput, StatisticsInput>({
      query: (body) => ({
        url: '/trades/statistics',
        method: 'POST',
        data: body
      }),
      providesTags: ['globalInformations']
    }),
    getTradesDetails: builder.query<TradesDetailsOutput, { trades: string[] }>({
      query: (body) => ({
        url: '/trades/trades-details',
        method: 'POST',
        data: body
      }),
      providesTags: ['globalInformations']
    })
  }),
  overrideExisting: false
})

export const {
  useGetTradersRankingQuery,
  useGetGeneralFeelingQuery,
  useGetStatisticsQuery,
  useGetTradesDetailsQuery
} = informationsCenterApi
