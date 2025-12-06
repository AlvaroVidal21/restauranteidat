import { createStore,combineReducers } from 'redux';
import counterReducer from '../Reducers/counterReducer';
import afpReducer from '../Reducers/afpReducer';


const rootReducer = combineReducers({
  contador: counterReducer,
  afp: afpReducer
});

const store = createStore(rootReducer);
//const store = createStore(counterReducer);
export default store;


