import {createSelector} from 'reselect';
import {
  REQUEST_PREDICTIONS, RECEIVE_PREDICTIONS, FAIL_PREDICTIONS,
} from '../actions/predictions.js';

export const predictions = (state = {model: null}, action) => {
  switch (action.type) {
    case REQUEST_PREDICTIONS:
      return {
        ...state,
        model: action.model,
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
    default:
      return state;
  }
};

export const itemsSelector = state => state.predictions && state.predictions.items;

export const itemListSelector = createSelector(
  itemsSelector,
  (items) => {
    return items ? items : [{}, {}, {}, {}, {}];
  }
);
