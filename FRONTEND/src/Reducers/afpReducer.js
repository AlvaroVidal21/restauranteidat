const initialState = { porcentaje: 0 };
const afpReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'habitat':
      return { porcentaje: 11.17 };
    case 'profuturo':
      return { porcentaje: 12.12 };
    default:
      return state;
  }};
export default afpReducer;    