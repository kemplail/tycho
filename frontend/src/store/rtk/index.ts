import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../axiosBaseQuery'

export const rtkApi = createApi({
  tagTypes: ['globalInformations', 'User'],
  reducerPath: 'rtkApi',
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({})
})
