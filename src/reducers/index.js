import { combineReducers } from 'redux';
import moduleReducer from './moduleReducer';
import userReducer from './user';
import chatsReducer from './chats';

const rootReducer = combineReducers({
  module: moduleReducer,
  user: userReducer,
  chats: chatsReducer
});

export default rootReducer;
