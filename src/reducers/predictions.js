import {createSelector} from 'reselect';
import {
  FAIL_PREDICTIONS,
  RECEIVE_PREDICTIONS,
  REQUEST_PREDICTIONS,
  ADD_PREDICTION,
  REMOVE_PREDICTION
} from '../actions/predictions.js';

export const predictions = (state = {}, action) => {
  switch (action.type) {
    case REQUEST_PREDICTIONS:
      return {
        ...state,
        items: null, // reset items
        failure: false,
        isFetching: true
      };
    case RECEIVE_PREDICTIONS:
      return {
        ...state,
        items: action.items,
        failure: false,
        isFetching: false
      };
    case FAIL_PREDICTIONS:
      return {
        ...state,
        items: null,
        error: action.error,
        failure: true,
        isFetching: false
      };
    case ADD_PREDICTION:
      return {
        ...state,
        items: {
          ...state.items,
          [action.item.id]: action.item
        }
      };
    case REMOVE_PREDICTION:
      return {
        ...state,
        items: Object.keys(state.items).reduce((obj, key) => {
          if (key !== action.id) {
            obj[key] = state.items[key];
          }
          return obj;
        }, {}),
      };
    default:
      return state;
  }
};

export const itemsSelector = state => state.predictions && state.predictions.items;

export const itemListSelector = createSelector(
  itemsSelector,
  (items) => {
    if (!items) {
      return [];
    }
    return Object.keys(items).map(key => items[key]);
  }
);
