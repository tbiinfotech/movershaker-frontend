import { combineReducers } from 'redux'
import userReducer from './user'
import chatsReducer from './chats'
import darkThemeEnabledReducer from './darkThemeEnabled'

const rootReducer = combineReducers({
  user: userReducer,
  chats: chatsReducer,
})

export default rootReducer
