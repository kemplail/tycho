import axios, { AxiosInstance } from 'axios'
import { clearState } from 'src/store/slices/user'
import store from '../store'

const api: AxiosInstance = axios.create({
  // baseURL: process.env.REACT_APP_API
  baseURL: 'http://localhost:5000'
})

api.interceptors.request.use(
  async (config) => {
    const state = store.getState()

    if (state.user.access_token !== '') {
      const { access_token } = state.user

      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${access_token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    if (response.status === 401 || response.status === 418) {
      store.dispatch(clearState())
    }
    return Promise.reject(error)
  }
)

export default api
