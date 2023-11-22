import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login } from '../../services/user'

export const loginUser = createAsyncThunk(
  'login',
  async ({ username, password }: { username: string; password: string }) => {
    const { data } = await login(username, password)
    return data
  }
)

interface TokenState {
  access_token?: string
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    access_token: localStorage.getItem('access_token') || '',
    status: 'idle'
  } as TokenState,
  reducers: {
    clearState: (state) => {
      state.access_token = ''
      state.status = 'idle'
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.access_token = action.payload?.access_token
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loginUser.rejected, (state) => {
        state.status = 'failed'
      })
  }
})

export const { clearState } = userSlice.actions
