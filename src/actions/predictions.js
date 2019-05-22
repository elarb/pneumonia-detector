export const REQUEST_PREDICTIONS = 'REQUEST_PREDICTIONS';
export const RECEIVE_PREDICTIONS = 'RECEIVE_PREDICTIONS';
export const FAIL_PREDICTIONS = 'FAIL_PREDICTIONS';
export const ADD_PREDICTION = 'ADD_PREDICTION';
export const REMOVE_PREDICTION = 'REMOVE_PREDICTION';

export const fetchPredictions = () => (dispatch, getState) => {
  if (!shouldFetchPredictions(getState())) {
    return;
  }

  dispatch(requestPredictions());

  // wait for auth change
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      return;
    }

    let query = firebase.firestore().collection("predictions");
    // fetch public predictions for quest accounts
    if (user.isAnonymous) {
      query = query.where("isPublic", "==", true).limit(50);
    } else if (user && user.uid) {
      query = query.where("userId", "==", user.uid);
    } else {
      dispatch(failPredictions());
      return;
    }

    query.get()
      .then(querySnapshot => {
        let preds = querySnapshot.docs.map(d => d.data());
        preds = preds.reduce((obj, item) => {
          obj[item.id] = item;
          return obj
        }, {});
        dispatch(receivePredictions(preds));
      })
      .catch(error => {
        dispatch(failPredictions(error));
      });
  });

};

const shouldFetchPredictions = (state) => {
  return state.predictions && !state.predictions.isFetching && !state.predictions.items;
};

const requestPredictions = () => {
  return {
    type: REQUEST_PREDICTIONS
  };
};

const receivePredictions = (items) => {
  return {
    type: RECEIVE_PREDICTIONS,
    items
  };
};

const failPredictions = (error) => {
  return {
    type: FAIL_PREDICTIONS,
    error
  };
};

export const addPredictionList = (item) => {
  return {
    type: ADD_PREDICTION,
    item
  }
};

export const removePredictionList = (id) => {
  return {
    type: REMOVE_PREDICTION,
    id
  }
};
