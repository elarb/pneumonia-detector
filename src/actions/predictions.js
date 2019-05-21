export const REQUEST_PREDICTIONS = 'REQUEST_PREDICTIONS';
export const RECEIVE_PREDICTIONS = 'RECEIVE_PREDICTIONS';
export const FAIL_PREDICTIONS = 'FAIL_PREDICTIONS';

// fetch predictions by query (different models)
export const fetchPredictions = (model) => (dispatch, getState) => {
  if (!shouldFetchPredictions(getState(), model)) {
    return;
  }

  dispatch(requestPredictions(model));

  // wait for auth change
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      return;
    }

    let query = firebase.firestore().collection("predictions").where("userId", "==", user.uid);

    if (model) {
      query = query.where("model", "==", model);
    }

    query.get()
      .then(querySnapshot => {
        dispatch(receivePredictions(model, querySnapshot.docs.map(d => d.data())));
      })
      .catch(error => {
        dispatch(failPredictions(model, error));
      });
  });

};

const shouldFetchPredictions = (state, model) => {
  return state.predictions.failure || state.predictions.model !== model && !state.predictions.isFetching;
};

const requestPredictions = (model) => {
  return {
    type: REQUEST_PREDICTIONS,
    model
  };
};

const receivePredictions = (model, items) => {
  return {
    type: RECEIVE_PREDICTIONS,
    model,
    items
  };
};

const failPredictions = (model, error) => {
  return {
    type: FAIL_PREDICTIONS,
    model,
    error
  };
};
