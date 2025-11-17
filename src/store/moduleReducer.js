// // action - state management
// import { FETCH_PROGRAMS } from './actions';

// // initial state
// export const initialState = {
//   loading: true,
//   data: null
// };

// // ==============================|| MODULE REDUCER ||============================== //

// const module = (state = initialState, action) => {
//   switch (action.type) {
//     case FETCH_PROGRAMS: {
//       return {
//         ...state,
//         loading: false,
//         data: action.payload
//       };
//     }
//     default: {
//       return { ...state };
//     }
//   }
// };

// export default module;
