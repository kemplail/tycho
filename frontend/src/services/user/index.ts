import { AxiosResponse } from 'axios'
import api from '..'

export const login = (
  username: string,
  password: string
): Promise<AxiosResponse<any>> => api.post('auth/login', { username, password })
