import { BaseQueryFn } from '@reduxjs/toolkit/dist/query'
import { AxiosError, AxiosRequestConfig } from 'axios'
import api from '../services'

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string
      method: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
    },
    unknown,
    AxiosError
  > =>
  async ({ url, method, data }) => {
    try {
      const result = await api({ url, method, data })
      return { data: result.data }
    } catch (axiosError) {
      return { error: axiosError as AxiosError }
    }
  }
