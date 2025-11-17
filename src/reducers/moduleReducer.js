import { FETCH_PROGRAMS, FETCH_STUDENTS } from '../store/actions';

export const initialState = {
  loading: true,
  programs: [],
  students: []
};

const module = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROGRAMS:
      return {
        ...state,
        loading: false,
        programs: action.data
      };

    case FETCH_STUDENTS:
      return {
        ...state,
        loading: false,
        students: action.data
      };

    default: {
      return { ...state };
    }
  }
};

export default module;
