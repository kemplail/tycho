import { Action, CombinedState, combineReducers } from 'redux'
import { userSlice } from '../slices/user'
import { rtkApi } from '../rtk'

const appReducer = combineReducers({
  [rtkApi.reducerPath]: rtkApi.reducer,
  [userSlice.name]: userSlice.reducer
})

const rootReducer = (state: CombinedState<any>, action: Action) => {
  if (action.type === 'user/clearState') {
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

export default rootReducer
