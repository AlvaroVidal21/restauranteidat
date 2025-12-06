import { createStore } from 'redux';
import afpReducer from '../Reducers/afpReducer';

const storeAfp = createStore(afpReducer);
export default storeAfp;