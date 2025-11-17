import { createStore, compose } from 'redux'
import rootReducer from '../reducers'


export const store = createStore(rootReducer);

export type AppState = ReturnType<typeof rootReducer>
