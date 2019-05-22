import {createSelector} from 'reselect';
import {itemsSelector} from './predictions.js';
import {
  REQUEST_PREDICTION, RECEIVE_PREDICTION, FAIL_PREDICTION, REMOVE_PREDICTION
} from '../actions/prediction.js';


export const prediction = (state = {}, action) => {
  switch (action.type) {
    case REQUEST_PREDICTION:
      return {
        ...state,
        id: action.id,
        failure: false,
        isFetching: true
      };
    case RECEIVE_PREDICTION:
      return {
        ...state,
        item: action.item,
        failure: false,
        isFetching: false
      };
    case FAIL_PREDICTION:
      return {
        ...state,
        failure: true,
        isFetching: false,
        error: action.error
      };
    case REMOVE_PREDICTION:
      return {
        ...state,
        item: {},
      };
    default:
      return state;
  }
};

const idSelector = state => state.prediction.id;
const itemSelector = state => state.prediction.item;

export const predictionSelector = createSelector(
  idSelector,
  itemsSelector,
  itemSelector,
  (id, items, item) => {
    return items && items[id] || item;
  }
);
