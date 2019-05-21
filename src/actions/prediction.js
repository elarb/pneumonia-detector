export const REQUEST_PREDICTION = 'REQUEST_PREDICTION';
export const RECEIVE_PREDICTION = 'RECEIVE_PREDICTION';
export const FAIL_PREDICTION = 'FAIL_PREDICTION';

export const listenPrediction = (id) => (dispatch, getState) => {
  if (!id) {
    // id empty, clear result
    dispatch(receivePrediction(id, {}));
  }
  dispatch(requestPrediction(id));

  const state = getState();
  const prediction = state.predictions && state.predictions.items && state.predictions.items[id];
  if (prediction) {
    // prediction found in state.predictions.items
    dispatch(receivePrediction(id));
    // let the calling code know there's nothing to wait for.
    return Promise.resolve();
  }

  // fetch prediction data given the prediction id.
  let unsubscribe = firebase.firestore().collection('predictions')
    .doc(id)
    .onSnapshot(doc => {
      if (!doc.exists) {
        return;
      }

      let predData = doc.data();
      if (predData.predictionErr) {
        dispatch(failPrediction(id, predData.predictionErr));
      } else {
        dispatch(receivePrediction(id, predData));
      }
      // Stop listening to changes
      unsubscribe();
    }, err => {
      dispatch(failPrediction(id, err));
    });
};

export const fetchPrediction = (id) => (dispatch, getState) => {
  if (!id) {
    // id empty, clear result
    dispatch(receivePrediction(id, {}));
  }
  dispatch(requestPrediction(id));

  const state = getState();
  const prediction = state.predictions && state.predictions.items && state.predictions.items[id];
  if (prediction) {
    // prediction found in state.predictions.items
    dispatch(receivePrediction(id));
    // let the calling code know there's nothing to wait for.
    return Promise.resolve();
  }

  firebase.firestore().collection('predictions')
    .doc(id)
    .get().then(doc => {
    if (!doc.exists) {
      console.log('doc doesnt exist');
      dispatch(failPrediction(id));
      return Promise.resolve();
    }

    let predData = doc.data();
    if (predData.predictionErr) {
      dispatch(failPrediction(id, predData.predictionErr));
    } else {
      dispatch(receivePrediction(id, predData));
    }
  }).catch(err => {
    dispatch(failPrediction(id, err));
  });
};

const requestPrediction = (id) => {
  return {
    type: REQUEST_PREDICTION,
    id
  };
};

const receivePrediction = (id, item) => {
  return {
    type: RECEIVE_PREDICTION,
    id,
    item
  };
};

const failPrediction = (id, error) => {
  return {
    type: FAIL_PREDICTION,
    id,
    error
  };
};
